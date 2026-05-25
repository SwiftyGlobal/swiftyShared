import type { DedupUserRow } from '../../utils/name-dedup.utils';
import {
  buildFuzzyDuplicatesQuery,
  buildSignupDedupReviewInsert,
  dedupMatchType,
  dobMatch,
  fingerprint,
  jwScore,
  JW_THRESHOLD,
  matchFuzzyDuplicatesFromRows,
  normalizeDob,
  normalizeForCompare,
  normalizePostcode,
  postcodeMatch,
  stripSalutations,
} from '../../utils/name-dedup.utils';
import type { EncryptService } from '../../services/encrypt.service';

// Mock that mirrors EncryptService failure semantics: decrypt returns the input on failure.
function makeMockEncrypt(): EncryptService {
  const ENC = 'enc:';
  const encrypt = (plain: string): string => `${ENC}${plain}`;
  const decrypt = (cipher: string): string => (cipher.startsWith(ENC) ? cipher.slice(ENC.length) : cipher);
  return {
    encrypt,
    decrypt,
    encryptText: encrypt,
    decryptText: decrypt,
  } as unknown as EncryptService;
}

describe('stripSalutations', () => {
  it('removes leading salutations and collapses whitespace', () => {
    expect(stripSalutations('Mr. Stephen Stewart')).toBe('Stephen Stewart');
    expect(stripSalutations('Dr Jean-Paul')).toBe('Jean-Paul');
    expect(stripSalutations('Mrs.  Smith')).toBe('Smith');
  });

  it('returns empty string for null/undefined', () => {
    expect(stripSalutations(null)).toBe('');
    expect(stripSalutations(undefined)).toBe('');
  });
});

describe('normalizeForCompare', () => {
  it('keeps first + last token only, drops middles and initials', () => {
    expect(normalizeForCompare('Mr Stephen Christopher Stewart')).toBe('stephen stewart');
    expect(normalizeForCompare('Stephen C Stewart')).toBe('stephen stewart');
  });

  it('strips punctuation and hyphens', () => {
    expect(normalizeForCompare("Jean-Paul O'Brien")).toBe('jeanpaul obrien');
  });

  it('returns empty for nullish or junk-only input', () => {
    expect(normalizeForCompare(null)).toBe('');
    expect(normalizeForCompare('  ')).toBe('');
    expect(normalizeForCompare('---')).toBe('');
  });
});

describe('fingerprint', () => {
  it('produces identical phonetic fingerprints for spelling variants', () => {
    expect(fingerprint('Stephen Stewart')).toBe(fingerprint('Steven Stewart'));
  });

  it('returns empty for empty input', () => {
    expect(fingerprint('')).toBe('');
  });
});

describe('jwScore', () => {
  it('returns 1 for identical normalized names', () => {
    expect(jwScore('Stephen Stewart', 'stephen stewart')).toBe(1);
  });

  it('returns >= threshold for close variants', () => {
    expect(jwScore('Stephen Stewart', 'Stephan Stewart')).toBeGreaterThanOrEqual(JW_THRESHOLD);
  });

  it('returns 0 when either side normalizes to empty', () => {
    expect(jwScore('', 'Stephen')).toBe(0);
    expect(jwScore('Stephen', '')).toBe(0);
  });
});

describe('normalizePostcode / postcodeMatch', () => {
  it('canonicalizes uppercase and alphanumeric-only', () => {
    expect(normalizePostcode('sw1a 1aa')).toBe('SW1A1AA');
    expect(normalizePostcode('M1  1AE')).toBe('M11AE');
  });

  it('matches across spacing/casing variants', () => {
    expect(postcodeMatch('sw1a 1aa', 'SW1A1AA')).toBe(true);
    expect(postcodeMatch('SW1A-1AA', 'sw1a 1aa')).toBe(true);
  });

  it('does not match when either side is empty or different', () => {
    expect(postcodeMatch('', 'SW1A1AA')).toBe(false);
    expect(postcodeMatch('SW1A1AA', null)).toBe(false);
    expect(postcodeMatch('SW1A1AA', 'M11AE')).toBe(false);
  });
});

describe('normalizeDob / dobMatch', () => {
  it('canonicalizes any common format to YYYYMMDD', () => {
    expect(normalizeDob('1976-08-23')).toBe('19760823');
    expect(normalizeDob('1976/08/23')).toBe('19760823');
    expect(normalizeDob('1976-08-23T00:00:00.000Z')).toBe('19760823');
  });

  it('returns empty when fewer than 8 digits', () => {
    expect(normalizeDob('19/8')).toBe('');
    expect(normalizeDob(null)).toBe('');
  });

  it('matches equivalent representations', () => {
    expect(dobMatch('1976-08-23', '1976/08/23')).toBe(true);
    expect(dobMatch('1976-08-23', new Date(Date.UTC(1976, 7, 23)))).toBe(true);
  });

  it('does not match across different dates or empty input', () => {
    expect(dobMatch('1976-08-23', '1976-08-24')).toBe(false);
    expect(dobMatch('', '1976-08-23')).toBe(false);
  });
});

describe('buildFuzzyDuplicatesQuery', () => {
  const encryptService = makeMockEncrypt();

  it('returns null when candidate has no DOB and no postcode anchor', () => {
    expect(
      buildFuzzyDuplicatesQuery(encryptService, {
        first_name: 'Stephen',
        last_name: 'Stewart',
        country_code: 'GB',
      }),
    ).toBeNull();
  });

  it('returns null when the candidate name normalizes to empty', () => {
    expect(
      buildFuzzyDuplicatesQuery(encryptService, {
        first_name: '',
        last_name: '',
        country_code: 'GB',
        postcode: 'SW1A 1AA',
      }),
    ).toBeNull();
  });

  it('uses the canonicalized postcode (not raw) for the SQL cipher', () => {
    const built = buildFuzzyDuplicatesQuery(encryptService, {
      first_name: 'Stephen',
      last_name: 'Stewart',
      country_code: 'GB',
      postcode: 'sw1a 1aa',
    });
    expect(built).not.toBeNull();
    expect(built!.params).toContain('enc:SW1A1AA');
  });

  it('passes encrypted DOB as YYYY-MM-DD when given a Date', () => {
    const built = buildFuzzyDuplicatesQuery(encryptService, {
      first_name: 'Stephen',
      last_name: 'Stewart',
      country_code: 'GB',
      date_of_birth: new Date(Date.UTC(1976, 7, 23)),
    });
    expect(built).not.toBeNull();
    expect(built!.params).toContain('enc:1976-08-23');
  });

  it('appends exclude_sub_id and limit params when provided', () => {
    const built = buildFuzzyDuplicatesQuery(encryptService, {
      first_name: 'Stephen',
      last_name: 'Stewart',
      country_code: 'GB',
      date_of_birth: '1976-08-23',
      exclude_sub_id: 'sub-1',
      limit: 50,
    });
    expect(built).not.toBeNull();
    expect(built!.sql).toMatch(/sub_id <> \?/);
    expect(built!.sql).toMatch(/LIMIT \?/);
    expect(built!.params[built!.params.length - 1]).toBe(50);
    expect(built!.params).toContain('sub-1');
  });
});

describe('matchFuzzyDuplicatesFromRows', () => {
  const encryptService = makeMockEncrypt();

  function row(over: Partial<DedupUserRow> = {}): DedupUserRow {
    return {
      id: 1,
      sub_id: 'sub-1',
      first_name: encryptService.encrypt('Stephen'),
      last_name: encryptService.encrypt('Stewart'),
      address_zip: encryptService.encryptText('SW1A1AA'),
      date_of_birth: encryptService.encrypt('1976-08-23'),
      ...over,
    };
  }

  it('returns a phonetic match anchored on DOB', () => {
    const matches = matchFuzzyDuplicatesFromRows(
      encryptService,
      { first_name: 'Steven', last_name: 'Stewart', date_of_birth: '1976-08-23' },
      [row()],
    );
    expect(matches).toEqual([{ user_id: 1, sub_id: 'sub-1', name_match: 'phonetic', anchor: 'dob', score: 1 }]);
  });

  it('returns a JW match anchored on postcode when phonetic differs', () => {
    const matches = matchFuzzyDuplicatesFromRows(
      encryptService,
      { first_name: 'Stephan', last_name: 'Stewart', postcode: 'SW1A 1AA' },
      [row()],
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].anchor).toBe('postcode');
    expect(matches[0].name_match === 'phonetic' || matches[0].name_match === 'jw').toBe(true);
  });

  it('skips rows whose name field is unreadable (decrypt returns input ciphertext)', () => {
    const corrupt = row({ first_name: 'NOT-A-CIPHER' });
    const matches = matchFuzzyDuplicatesFromRows(
      encryptService,
      { first_name: 'Stephen', last_name: 'Stewart', date_of_birth: '1976-08-23' },
      [corrupt],
    );
    expect(matches).toEqual([]);
  });

  it('skips rows whose anchor field is unreadable', () => {
    const corrupt = row({ date_of_birth: 'NOT-A-CIPHER', address_zip: 'NOT-A-CIPHER' });
    const matches = matchFuzzyDuplicatesFromRows(
      encryptService,
      { first_name: 'Stephen', last_name: 'Stewart', date_of_birth: '1976-08-23', postcode: 'SW1A 1AA' },
      [corrupt],
    );
    expect(matches).toEqual([]);
  });

  it('returns no matches when the name is too far apart', () => {
    const matches = matchFuzzyDuplicatesFromRows(
      encryptService,
      { first_name: 'Aleksandr', last_name: 'Kuznetsov', date_of_birth: '1976-08-23' },
      [row()],
    );
    expect(matches).toEqual([]);
  });

  it('prefers DOB anchor over postcode anchor when both line up', () => {
    const matches = matchFuzzyDuplicatesFromRows(
      encryptService,
      { first_name: 'Stephen', last_name: 'Stewart', date_of_birth: '1976-08-23', postcode: 'SW1A 1AA' },
      [row()],
    );
    expect(matches[0].anchor).toBe('dob');
  });
});

describe('buildSignupDedupReviewInsert', () => {
  it('returns null when there are no matches to persist', () => {
    expect(buildSignupDedupReviewInsert({ user_id: 1, sub_id: 'sub-1', country_code: 'GB', matches: [] })).toBeNull();
  });

  it('produces a row per match with status=pending and the right match_type', () => {
    const built = buildSignupDedupReviewInsert({
      user_id: 1,
      sub_id: 'sub-1',
      country_code: 'GB',
      matches: [{ user_id: 2, sub_id: 'sub-2', name_match: 'phonetic', anchor: 'dob', score: 1 }],
    });
    expect(built).not.toBeNull();
    expect(built!.values).toHaveLength(1);
    const [userId, subId, matchedUserId, matchedSubId, country, matchType, anchor, score, status] = built!.values[0];
    expect(userId).toBe(1);
    expect(subId).toBe('sub-1');
    expect(matchedUserId).toBe(2);
    expect(matchedSubId).toBe('sub-2');
    expect(country).toBe('GB');
    expect(matchType).toBe('phonetic_dob');
    expect(anchor).toBe('dob');
    expect(score).toBe(1);
    expect(status).toBe('pending');
  });
});

describe('dedupMatchType', () => {
  it('joins name_match and anchor with underscore', () => {
    expect(dedupMatchType({ name_match: 'phonetic', anchor: 'dob' })).toBe('phonetic_dob');
    expect(dedupMatchType({ name_match: 'jw', anchor: 'postcode' })).toBe('jw_postcode');
  });
});
