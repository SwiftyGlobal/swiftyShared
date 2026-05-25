import * as naturalLib from 'natural';
import moment from 'moment';

import { EncryptService } from '../services/encrypt.service';

/**
 * Minimal DB connection contract — just the `.query(sql, params)` method shape exposed by
 * `mysql2/promise` Pool. Kept local so this package stays DB-driver-agnostic; callers pass
 * whichever pool / wrapper they already use.
 */
export interface DedupDbCon {
  query<T = unknown>(sql: string, params?: unknown): Promise<[T, unknown]>;
}

interface MetaphoneInstance {
  process(token: string, maxLength?: number): string;
}
type MetaphoneCtor = new () => MetaphoneInstance;

const natural = naturalLib as unknown as {
  Metaphone: MetaphoneCtor;
  JaroWinklerDistance(s1: string, s2: string): number;
};

const metaphone: MetaphoneInstance = new natural.Metaphone();

const SALUTATION_RE = /\b(mr|mrs|ms|miss|misses|mister|dr|prof)\b\.?/gi;

export const JW_THRESHOLD = 0.9;

/**
 * A duplicate is only ever flagged when the two records line up on an **anchor** — the same
 * postcode or the same date of birth — AND the names match (identical Metaphone fingerprint, or
 * Jaro-Winkler >= JW_THRESHOLD). Names are reduced to first + last only before comparison, so
 * "Stephen Christopher Stewart" and "Stephen Stewart" are treated as the same name.
 *
 * Name similarity on its own (no anchor) is never a match — on short, common names it produces a
 * huge number of false positives. `match_type` is `<name_match>_<anchor>`.
 */
export type DedupAnchor = 'postcode' | 'dob';
export type DedupNameMatch = 'phonetic' | 'jw';
export type DedupMatchType = `${DedupNameMatch}_${DedupAnchor}`;

export interface DedupMatch {
  user_id: number;
  sub_id: string;
  name_match: DedupNameMatch;
  anchor: DedupAnchor;
  score: number;
}

export function dedupMatchType(m: Pick<DedupMatch, 'name_match' | 'anchor'>): DedupMatchType {
  return `${m.name_match}_${m.anchor}`;
}

export function stripSalutations(name: string | null | undefined): string {
  if (!name) return '';
  return name.replace(SALUTATION_RE, '').replace(/\s+/g, ' ').trim();
}

/**
 * Lowercase, drop salutations/punctuation/lone middle initials, then keep only the first and last
 * token: "Mr Stephen Christopher Stewart" -> "stephen stewart", "Jean-Paul O'Brien" -> "jeanpaul obrien".
 */
export function normalizeForCompare(name: string | null | undefined): string {
  if (!name) return '';
  const cleaned = name
    .toLowerCase()
    .replace(SALUTATION_RE, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\b[a-z]\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  const tokens = cleaned.split(' ').filter(Boolean);
  if (tokens.length <= 2) return tokens.join(' ');
  return `${tokens[0]} ${tokens[tokens.length - 1]}`;
}

export function fingerprint(fullName: string): string {
  const normalized = normalizeForCompare(fullName);
  if (!normalized) return '';
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((t) => metaphone.process(t))
    .sort()
    .join(' ');
}

export function jwScore(a: string, b: string): number {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (!na || !nb) return 0;
  return natural.JaroWinklerDistance(na, nb);
}

/**
 * Canonical form of a postcode/zip for equality checks: uppercase, alphanumerics only.
 * "sw1a 1aa" -> "SW1A1AA", "M1  1AE" -> "M11AE". Returns '' for empty/whitespace/junk input.
 */
export function normalizePostcode(postcode: string | null | undefined): string {
  if (!postcode) return '';
  return String(postcode)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Two postcodes "match" only when both are present and canonicalise to the same value. */
export function postcodeMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = normalizePostcode(a);
  return na !== '' && na === normalizePostcode(b);
}

/**
 * Canonical DOB for equality checks: the first 8 digits (YYYYMMDD) — handles "1976-08-23",
 * "1976/08/23", "1976-08-23T00:00:00.000Z". Returns '' when there aren't 8 digits to work with.
 */
export function normalizeDob(dob: string | Date | null | undefined): string {
  if (!dob) return '';
  const digits = (dob instanceof Date ? dob.toISOString() : String(dob)).replace(/[^0-9]/g, '');
  return digits.length >= 8 ? digits.slice(0, 8) : '';
}

/** Two DOBs "match" only when both are present and canonicalise to the same YYYYMMDD. */
export function dobMatch(a: string | Date | null | undefined, b: string | Date | null | undefined): boolean {
  const na = normalizeDob(a);
  return na !== '' && na === normalizeDob(b);
}

export interface DedupUserRow {
  id: number;
  sub_id: string;
  first_name: string;
  last_name: string;
  address_zip: string | null;
  date_of_birth: string | null;
}

export interface DedupCandidateInput {
  first_name: string;
  last_name: string;
  country_code: string;
  postcode?: string | null;
  date_of_birth?: string | Date | null;
  exclude_sub_id?: string;
  limit?: number;
}

/** `users.address_zip` is written via EncryptService.encryptText() at signup. */
function decryptPostcode(encryptService: EncryptService, value: string | null | undefined): string {
  if (!value) return '';
  try {
    return (encryptService.decryptText(value) as string) || '';
  } catch {
    return '';
  }
}

/** `users.date_of_birth` is written via EncryptService.encrypt(). */
function decryptDob(encryptService: EncryptService, value: string | null | undefined): string {
  if (!value) return '';
  try {
    return (encryptService.decrypt(value) as string) || '';
  } catch {
    return '';
  }
}

/**
 * Build the anchor-narrowed SELECT for fuzzy-dedup candidates. Caller runs the query and feeds the
 * rows into `matchFuzzyDuplicatesFromRows`. Returns null when the candidate has no anchor (no DOB,
 * no postcode) or no usable normalised name — nothing to scan for in those cases.
 *
 * Encryption is deterministic, so we can match the stored ciphertext of the candidate's DOB /
 * postcode directly: `date_of_birth` is `encrypt(raw 'YYYY-MM-DD')`, `address_zip` is
 * `encryptText(rawPostcode.toUpperCase())`. A postcode typed in a different spacing than the stored
 * record won't match here — those rely on the DOB anchor instead.
 */
export function buildFuzzyDuplicatesQuery(
  encryptService: EncryptService,
  candidate: DedupCandidateInput,
): { sql: string; params: Array<string | number> } | null {
  const candidatePostcode = normalizePostcode(candidate.postcode);
  const candidateDob = normalizeDob(candidate.date_of_birth);
  if (!candidatePostcode && !candidateDob) return null;

  const candidateFull = `${candidate.first_name} ${candidate.last_name}`.trim();
  if (!normalizeForCompare(candidateFull)) return null;

  const params: Array<string | number> = [candidate.country_code];
  const anchorConds: string[] = [];
  if (candidateDob) {
    const dobForCipher =
      candidate.date_of_birth instanceof Date
        ? candidate.date_of_birth.toISOString().slice(0, 10)
        : String(candidate.date_of_birth).trim();
    anchorConds.push('date_of_birth = ?');
    params.push(encryptService.encrypt(dobForCipher) as string);
  }
  if (candidatePostcode) {
    anchorConds.push('address_zip = ?');
    params.push(encryptService.encryptText(String(candidate.postcode).toUpperCase()) as string);
  }

  let sql = `
    SELECT id, sub_id, first_name, last_name, address_zip, date_of_birth
    FROM users
    WHERE country = ?
      AND (${anchorConds.join(' OR ')})
      AND first_name IS NOT NULL AND first_name <> ''
      AND last_name IS NOT NULL AND last_name <> ''
  `;
  if (candidate.exclude_sub_id) {
    sql += ' AND sub_id <> ?';
    params.push(candidate.exclude_sub_id);
  }
  // When `limit` is set, scan only the most recently registered N candidates that already match the
  // anchor (used by signup-time background scan to bound latency). Worker callers leave `limit` unset
  // for a full sweep.
  if (typeof candidate.limit === 'number' && candidate.limit > 0) {
    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(candidate.limit);
  }

  return { sql, params };
}

/**
 * Pure matcher. Given the anchor-narrowed rows (loaded via `buildFuzzyDuplicatesQuery`), decrypts
 * each row's name + anchor field, applies the phonetic / Jaro-Winkler comparison, and returns the
 * confirmed `DedupMatch[]`. No DB access — the caller owns the query.
 */
export function matchFuzzyDuplicatesFromRows(
  encryptService: EncryptService,
  candidate: Pick<DedupCandidateInput, 'first_name' | 'last_name' | 'postcode' | 'date_of_birth'>,
  rows: DedupUserRow[],
): DedupMatch[] {
  const candidatePostcode = normalizePostcode(candidate.postcode);
  const candidateDob = normalizeDob(candidate.date_of_birth);
  const candidateFull = `${candidate.first_name} ${candidate.last_name}`.trim();
  const candidateNorm = normalizeForCompare(candidateFull);
  if (!candidateNorm) return [];
  const candidateFp = fingerprint(candidateFull);

  const matches: DedupMatch[] = [];
  for (const row of rows) {
    // Which anchor lines this row up with the candidate? DOB takes precedence over postcode.
    let anchor: DedupAnchor | null = null;
    if (candidateDob && dobMatch(candidateDob, decryptDob(encryptService, row.date_of_birth))) {
      anchor = 'dob';
    } else if (
      candidatePostcode &&
      postcodeMatch(candidatePostcode, decryptPostcode(encryptService, row.address_zip))
    ) {
      anchor = 'postcode';
    }
    if (!anchor) continue;

    let plainFirst = '';
    let plainLast = '';
    try {
      plainFirst = encryptService.decrypt(row.first_name);
      plainLast = encryptService.decrypt(row.last_name);
    } catch {
      continue;
    }
    if (!plainFirst || !plainLast) continue;
    const otherFull = `${plainFirst} ${plainLast}`.trim();

    let nameMatch: DedupNameMatch | null = null;
    let score = 0;
    const otherFp = fingerprint(otherFull);
    if (candidateFp && otherFp && candidateFp === otherFp) {
      nameMatch = 'phonetic';
      score = 1;
    } else {
      const s = jwScore(candidateFull, otherFull);
      if (s >= JW_THRESHOLD) {
        nameMatch = 'jw';
        score = Number(s.toFixed(3));
      }
    }
    if (!nameMatch) continue;

    matches.push({ user_id: row.id, sub_id: row.sub_id, name_match: nameMatch, anchor, score });
  }

  return matches;
}

/**
 * Build the bulk-INSERT payload for `users_signup_dedup_review`. Caller runs:
 *   pool.query(sql, [values])
 * Returns null when there are no matches to persist.
 */
export function buildSignupDedupReviewInsert(args: {
  user_id: number;
  sub_id: string;
  country_code: string;
  matches: DedupMatch[];
}): { sql: string; values: Array<Array<string | number>> } | null {
  if (!args.matches.length) return null;

  const createdAt = moment().utc().format('YYYY-MM-DD HH:mm:ss');
  const sql = `
    INSERT INTO users_signup_dedup_review
      (user_id, sub_id, matched_user_id, matched_sub_id, country_code, match_type, anchor, score, status, createdAt)
    VALUES ?
  `;
  const values = args.matches.map((m) => [
    args.user_id,
    args.sub_id,
    m.user_id,
    m.sub_id,
    args.country_code,
    dedupMatchType(m),
    m.anchor,
    m.score,
    'pending',
    createdAt,
  ]);

  return { sql, values };
}

/**
 * DB-aware convenience: build the query, run it via `dbCon`, hand the rows to the pure matcher.
 * New callers should prefer `buildFuzzyDuplicatesQuery` + `matchFuzzyDuplicatesFromRows` so the
 * caller owns the DB connection.
 */
export async function findFuzzyNameDuplicates(
  dbCon: DedupDbCon,
  encryptService: EncryptService,
  candidate: DedupCandidateInput,
): Promise<DedupMatch[]> {
  const built = buildFuzzyDuplicatesQuery(encryptService, candidate);
  if (!built) return [];
  const [rows] = (await dbCon.query<DedupUserRow[]>(built.sql, built.params)) as [
    DedupUserRow[],
    unknown,
  ];
  return matchFuzzyDuplicatesFromRows(encryptService, candidate, rows);
}

/**
 * DB-aware convenience: build the bulk-INSERT and run it via `dbCon`. Best-effort — logs and
 * swallows DB errors. New callers should prefer `buildSignupDedupReviewInsert` and own the write.
 */
export async function insertSignupDedupReview(
  dbCon: DedupDbCon,
  args: {
    user_id: number;
    sub_id: string;
    country_code: string;
    matches: DedupMatch[];
  },
): Promise<void> {
  const built = buildSignupDedupReviewInsert(args);
  if (!built) return;
  try {
    await dbCon.query(built.sql, [built.values]);
  } catch {
    // best-effort write; caller-side path now owns logging via its DB helper
  }
}
