/**
 * Acca Boost tier resolver — Trello [5063].
 *
 * Pure functions shared by the auto-settle worker (swiftyPredictionsELBAPI)
 * and the manual-settle CMS (SwiftyPredictionsCMSEB). The repos used to keep
 * near-identical copies; consolidating here keeps tier-rule changes in one
 * place and guarantees preview / persist parity.
 *
 * Design rules:
 *  - No DB access. Each repo passes its own loaded config in.
 *  - No logging side-effects.
 *  - When NO leg is void/pushed, keep the placement-time tier (snapshot or
 *    legacy placement bet_type) verbatim — preview paths run before any leg
 *    is graded and must not downgrade.
 *  - When at least one leg IS void/pushed, recompute the tier from the
 *    effective fold (graded legs only: winner/loser/half_won/half_lost).
 *  - Snapshot percentage caps the recomputed tier — voids may only downgrade.
 *  - Below-table floor: if effective fold < smallest configured tier, use
 *    the lowest configured tier's percentage.
 */

/** Single tier entry from `settings_v2.acca_boost_bet_types`. */
export interface AccaBoostTier {
  bet_type: string; // "double" | "treble" | "fold4" | ... | "foldN"
  percentage_boost: number | string;
}

/** Live acca config loaded from settings_v2 by each consumer repo. */
export interface AccaBoostConfig {
  enabled: boolean;
  bet_types: AccaBoostTier[];
  max_award?: number;
  // Other settings_v2 fields (minimum_odds, all_markets, sports_markets) are
  // not consulted by the resolver — they gate at the orchestrator level.
}

/** Placement-time snapshot stored on users_bets.acca_boost_rules. */
export interface AccaRulesSnapshot {
  percentage_boost: number | string;
  max_award?: number | string;
  // applied_percentage_boost / applied_max_award are trader-override audit
  // fields surfaced elsewhere; not consulted by the resolver.
  [key: string]: unknown;
}

/** Leg shape consumed by the resolver — only `result` is read. */
export interface BoostLeg {
  result?: string | null;
  /** Fully resolved winning-leg odd under BOG (post-R4, post-SP selection).
   *  Used by calculateLuckyBoost's one-winner branch when include_bog is true. */
  bog_odd?: number | null;
  [key: string]: unknown;
}

/** Resolver output. `effective_fold` is null when the no-void path was taken. */
export interface AccaTierResolution {
  percentage: number;
  max_award: number;
  effective_fold: number | null;
}

const GRADED_RESULTS = new Set(['winner', 'loser', 'half_won', 'half_lost']);
const VOID_RESULTS = new Set(['void', 'pushed', 'push']);

/**
 * Map an effective fold count to the bet_type key used by acca_boost_bet_types.
 * Mirrors how users_bets_multiple.bet_type is stored at placement
 * (SGB combinationsGenerator.service.ts).
 */
export function effectiveBetTypeKey(fold: number): string | null {
  const n = Number(fold);
  if (!Number.isFinite(n) || n < 2) return null;
  if (n === 2) return 'double';
  if (n === 3) return 'treble';
  return `fold${n}`;
}

/**
 * Parse a tier key ('double' | 'treble' | 'foldN') back to its fold count.
 * Used to find the smallest configured tier as a floor when effective fold
 * drops below the configured range.
 */
export function betTypeKeyToFold(key: string): number | null {
  if (typeof key !== 'string') return null;
  if (key === 'double') return 2;
  if (key === 'treble') return 3;
  const m = /^fold(\d+)$/.exec(key);
  return m ? Number(m[1]) : null;
}

/**
 * True iff any leg currently has a void/pushed result.
 */
export function hasAnyVoidLeg(legs: BoostLeg[] | null | undefined): boolean {
  if (!Array.isArray(legs)) return false;
  return legs.some((l) => VOID_RESULTS.has(String(l?.result ?? '').toLowerCase()));
}

/**
 * Count graded legs (winner/loser/half_won/half_lost). Voids and pushed
 * reduce the effective fold so they are excluded. Used as the input to
 * `effectiveBetTypeKey`.
 */
export function countEffectiveFold(legs: BoostLeg[] | null | undefined): number {
  if (!Array.isArray(legs)) return 0;
  return legs.reduce((acc, leg) => (GRADED_RESULTS.has(String(leg?.result ?? '').toLowerCase()) ? acc + 1 : acc), 0);
}

/**
 * MySQL JSON columns may come back as either an already-parsed object or a raw
 * string depending on the driver mode. Normalise to an object (or null) so the
 * caller can fall back to live config when the snapshot is missing/unparseable.
 *
 * Generic helper — used for acca_boost_rules, bb_boost_rules, lucky_boost_rules.
 */
export function parseRulesSnapshot<T extends Record<string, unknown> = Record<string, unknown>>(
  raw: unknown,
): T | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as T) : null;
  } catch {
    return null;
  }
}

export interface ResolveAccaTierParams {
  /** Live acca boost config from settings_v2. May be null if config is wiped/disabled. */
  config: AccaBoostConfig | null | undefined;
  /** Graded legs from user_bets_single (or equivalent). */
  bets: BoostLeg[] | null | undefined;
  /** Placement-time rules snapshot from users_bets.acca_boost_rules. */
  snapshot?: AccaRulesSnapshot | null;
  /**
   * Placement bet_type (e.g. "fold6", "treble"). Used as a fallback for
   * legacy bets that have no snapshot — match against live config to find
   * the placement tier.
   */
  placementBetType?: string | null;
}

/**
 * Re-evaluate the acca boost tier at settlement.
 *
 * Returns null when neither snapshot nor live config can produce a usable
 * percentage. See module-level doc for the full semantics.
 */
export function resolveAccaTier(params: ResolveAccaTierParams): AccaTierResolution | null {
  const { config, bets, snapshot, placementBetType } = params;

  const snapshotPct = snapshot && Number(snapshot.percentage_boost) > 0 ? Number(snapshot.percentage_boost) : 0;
  const snapshotMax = snapshot && Number(snapshot.max_award) > 0 ? Number(snapshot.max_award) : 0;

  const hasLiveTiers = !!(config && config.enabled && Array.isArray(config.bet_types) && config.bet_types.length > 0);

  // No voids → keep placement tier verbatim. This is the OPEN-bet preview path
  // and the all-winners settle path; both should match what the player was
  // promised at placement.
  if (!hasAnyVoidLeg(bets)) {
    if (snapshotPct > 0) {
      const finalMax = snapshotMax > 0 ? snapshotMax : hasLiveTiers ? Number(config!.max_award) || 0 : 0;
      return { percentage: snapshotPct, max_award: finalMax, effective_fold: null };
    }
    if (!hasLiveTiers || !placementBetType) return null;
    const cleanType = String(placementBetType).replace('bet_slip_place_', '');
    const match = config!.bet_types.find((bt) => bt.bet_type === cleanType);
    if (!match) return null;
    return {
      percentage: Number(match.percentage_boost) || 0,
      max_award: Number(config!.max_award) || 0,
      effective_fold: null,
    };
  }

  // At least one void: recompute by effective fold.
  const effectiveFold = countEffectiveFold(bets);

  let tierPct = 0;
  if (hasLiveTiers) {
    const key = effectiveBetTypeKey(effectiveFold);
    let match = key ? config!.bet_types.find((bt) => bt.bet_type === key) : null;
    if (!match) {
      // Below-table floor: use the lowest configured fold's percentage.
      const sorted = config!.bet_types
        .map((bt) => ({ ...bt, _fold: betTypeKeyToFold(bt.bet_type) }))
        .filter((bt): bt is AccaBoostTier & { _fold: number } => bt._fold !== null)
        .sort((a, b) => a._fold - b._fold);
      if (sorted.length > 0 && effectiveFold < sorted[0]._fold) {
        match = sorted[0];
      }
    }
    if (match) tierPct = Number(match.percentage_boost) || 0;
  }

  if (!hasLiveTiers) {
    if (snapshotPct <= 0) return null;
    return { percentage: snapshotPct, max_award: snapshotMax, effective_fold: effectiveFold };
  }

  // Cap by snapshot when present — voids may only downgrade, never upgrade.
  let finalPct = tierPct;
  if (snapshotPct > 0 && finalPct > snapshotPct) finalPct = snapshotPct;

  if (finalPct <= 0) return null;

  const finalMax = snapshotMax > 0 ? snapshotMax : Number(config!.max_award) || 0;
  return { percentage: finalPct, max_award: finalMax, effective_fold: effectiveFold };
}
