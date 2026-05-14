/**
 * Lucky Boost calculator — shared by auto-settle (worker) and manual-settle (CMS).
 * Pure function, no DB, no logging.
 *
 * Lucky bets (lucky15 / lucky31 / lucky63) carry two independent bonus rules:
 *
 *   - **one_winner**  — consolation when exactly 1 selection wins; boosts the
 *     winning single's odds via a "double" / "treble" / percentage multiplier.
 *   - **all_winners** — full-win bonus when every selection wins; a percentage
 *     of total winnings.
 *
 * Both branches are gated by:
 *   - the eligible_sports allow-list (when supplied; undefined = no gate, []
 *     = boost disabled),
 *   - any void/pushed leg disqualifies (uniformly for all three bet types),
 *   - a positive max_award cap (≤ 0 disables the boost entirely).
 *
 * Caller wraps the bare `{ amount, type }` result to its own response shape.
 */

import type { BoostLeg } from './accaBoost';
import { oddAfterRule4 } from './oddAdjustments';

/** Lucky bet types supported. Matches `BetSlipType.LUCKY_*` without the prefix. */
export const LUCKY_BET_TYPES = ['lucky15', 'lucky31', 'lucky63'] as const;
export type LuckyBetType = (typeof LUCKY_BET_TYPES)[number];

/** Number of single selections per Lucky bet type (lucky15 = 4 picks, etc.). */
export const LUCKY_TOTAL_SELECTIONS: Record<LuckyBetType, number> = {
  lucky15: 4,
  lucky31: 5,
  lucky63: 6,
};

/** Total winning lines per Lucky bet type (used to derive total stake). */
export const LUCKY_TOTAL_LINES: Record<LuckyBetType, number> = {
  lucky15: 15,
  lucky31: 31,
  lucky63: 63,
};

/** Per-bet-type rule shape stored at placement and replayed at settle. */
export interface LuckyPerTypeConfig {
  one_winner?: string | number | null;
  all_winners?: string | number | null;
  eligible_sports?: string[];
  max_award?: number;
  [key: string]: unknown;
}

/** Full live Lucky config from settings_v2.lucky_boost_config. */
export interface LuckyBoostConfig {
  enabled: boolean;
  config: Partial<Record<LuckyBetType, LuckyPerTypeConfig>> & {
    eligible_sports?: string[];
    max_award?: number;
  };
}

/** Strip `bet_slip_place_` if present and return the lucky bet-type slug. */
export function cleanLuckyBetType(input: string | null | undefined): string {
  if (input == null) return '';
  return String(input).replace('bet_slip_place_', '');
}

/** Return true iff `bet_type` (after stripping prefix) is a Lucky bet type. */
export function isLuckyBetType(input: string | null | undefined): input is LuckyBetType {
  const clean = cleanLuckyBetType(input);
  return (LUCKY_BET_TYPES as readonly string[]).includes(clean);
}

/**
 * Parse a Lucky boost value from CMS dropdown / settings JSON.
 *
 * Accepts: "double" | "treble" | "none" | "" | numeric (e.g. "5", "5%", 5).
 * Returns a discriminated union for safe handling.
 */
export type ParsedBoostValue =
  | { kind: 'none' }
  | { kind: 'double' }
  | { kind: 'treble' }
  | { kind: 'percent'; percent: number };

export function parseBoostValue(raw: unknown): ParsedBoostValue {
  if (raw === undefined || raw === null) return { kind: 'none' };
  const v = String(raw).trim().toLowerCase();
  if (!v || v === 'none') return { kind: 'none' };
  if (v === 'double') return { kind: 'double' };
  if (v === 'treble') return { kind: 'treble' };
  const num = parseFloat(v.replace('%', ''));
  if (!isNaN(num) && num > 0) return { kind: 'percent', percent: num };
  return { kind: 'none' };
}

/** Result of the Lucky boost calculation. */
export type LuckyBoostResult =
  | {
      amount: number;
      type: 'one_winner' | 'all_winners';
      /** The parsed value that drove the calculation — useful for label-building. */
      applied: ParsedBoostValue;
    }
  | { amount: 0; type: null; applied: null };

export interface CalculateLuckyBoostParams {
  /** Full Lucky config (placement snapshot wrapped, or live config). */
  config: LuckyBoostConfig | null | undefined;
  /** Lucky bet_type — accepts either `lucky15` or `bet_slip_place_lucky15`. */
  bet_type: string;
  /** Stake per line (NOT total stake). Total stake is derived via LUCKY_TOTAL_LINES. */
  stake_per_line: number;
  /** Total payout for the bet (sum of all winning lines), used by the all-winners branch. */
  return_amount: number;
  /** All Lucky single legs with `result` + `sport_slug` + `odd` (+ optional `rule_4`). */
  resultedSingleBets: BoostLeg[];
  /** Allow-list of sport slugs. Pass `undefined` to skip the gate; `[]` to disable boost. */
  eligible_sports?: string[];
  /** Single global cap. Pass `≤ 0` to disable the boost entirely. */
  max_award: number;
}

const EMPTY: LuckyBoostResult = { amount: 0, type: null, applied: null };

/**
 * Calculate Lucky boost amount + winning branch.
 *
 * Returns the bare numerics; callers wrap to their own response shape
 * (worker uses `{ amount, type }`, CMS wraps to
 * `{ boost_type, boost_percentage, boost_amount, boost_label }`).
 */
export function calculateLuckyBoost(params: CalculateLuckyBoostParams): LuckyBoostResult {
  const { config, resultedSingleBets, eligible_sports } = params;

  if (!config || !config.enabled) return EMPTY;
  if (!isLuckyBetType(params.bet_type)) return EMPTY;
  const clean = cleanLuckyBetType(params.bet_type) as LuckyBetType;

  // Void/pushed disqualifies the boost uniformly across lucky15/31/63.
  const legs = resultedSingleBets || [];
  const voids = legs.filter((b) => {
    const r = String(b?.result ?? '').toLowerCase();
    return r === 'void' || r === 'pushed' || r === 'push';
  }).length;
  if (voids > 0) return EMPTY;

  // eligible_sports gate (placement snapshot authoritative when supplied).
  // `undefined` → no gate. `[]` → disabled. Otherwise every leg's sport_slug
  // must be in the allow-list.
  if (Array.isArray(eligible_sports)) {
    const allowed = new Set(eligible_sports);
    for (const leg of legs) {
      const sport = (leg as { sport_slug?: string }).sport_slug;
      if (!allowed.has(sport ?? '')) return EMPTY;
    }
  }

  const perType = config.config?.[clean];
  if (!perType) return EMPTY;

  const totalSelections = LUCKY_TOTAL_SELECTIONS[clean];
  const totalLines = LUCKY_TOTAL_LINES[clean];
  const stake = Number(params.stake_per_line) || 0;

  // Single global cap across both branches. max_award ≤ 0 disables the boost.
  const cap = Number(params.max_award) || 0;
  if (cap <= 0) return EMPTY;

  const winners = legs.filter((b) => String(b?.result ?? '').toLowerCase() === 'winner').length;

  // ALL WINNERS: percentage of winnings on total return.
  if (winners === totalSelections) {
    const parsed = parseBoostValue(perType.all_winners);
    if (parsed.kind !== 'percent') return EMPTY;
    const totalStake = stake * totalLines;
    const winnings = Number(params.return_amount) - totalStake;
    if (winnings <= 0) return EMPTY;
    let amount = winnings * (parsed.percent / 100);
    if (amount <= 0) return EMPTY;
    if (amount > cap) amount = cap;
    return { amount, type: 'all_winners', applied: parsed };
  }

  // ONE WINNER (consolation): boost the winning single's R4-adjusted odds.
  if (winners === 1) {
    const parsed = parseBoostValue(perType.one_winner);
    if (parsed.kind === 'none') return EMPTY;

    const winningSingle = legs.find((leg) => String(leg?.result ?? '').toLowerCase() === 'winner') as
      | undefined
      | { odd?: number | string; odd_decimal?: number | string; rule_4?: number | string };
    if (!winningSingle) return EMPTY;

    const rawOdd = Number(winningSingle.odd_decimal ?? winningSingle.odd ?? 0);
    const odd = oddAfterRule4({ odd: rawOdd, rule4_percentage: winningSingle.rule_4 });
    if (odd <= 0 || stake <= 0) return EMPTY;

    // Bonus is a multiplier on the winnings portion only (stake always returned):
    //   double  → bonus = (odd - 1) × stake
    //   treble  → bonus = 2 × (odd - 1) × stake
    //   percent → bonus = (odd - 1) × stake × X/100
    const winningsPerLine = (odd - 1) * stake;
    let amount = 0;
    if (parsed.kind === 'double') amount = winningsPerLine;
    else if (parsed.kind === 'treble') amount = 2 * winningsPerLine;
    else if (parsed.kind === 'percent') amount = winningsPerLine * (parsed.percent / 100);

    if (amount <= 0) return EMPTY;
    if (amount > cap) amount = cap;
    return { amount, type: 'one_winner', applied: parsed };
  }

  return EMPTY;
}
