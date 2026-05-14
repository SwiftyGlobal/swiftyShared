/**
 * Bet Builder boost calculator — shared by auto-settle (worker) and
 * manual-settle (CMS). Pure function, no DB, no logging.
 *
 * Rules:
 *   - Every leg must be a clean "winner". Any non-clean-winner result
 *     (void / pushed / push / half_won / half_lost) disqualifies the boost,
 *     because the bet's leg composition no longer matches what the player
 *     placed.
 *   - Snapshot wins over live config (the player gets the rule they were
 *     promised at placement, even if the trader has since edited config).
 *   - winnings = return_amount - stake; if winnings ≤ 0 → boost = 0.
 *   - amount = winnings × (percentage / 100), capped by max_award, rounded
 *     to cents.
 *
 * Returns 0 when not eligible. Callers wrap to their own response shape.
 */

import type { BoostLeg } from './accaBoost';
import { parseRulesSnapshot } from './accaBoost';

/** Single entry from `settings_v2.bet_builder_boost_selections`. */
export interface BBBoostSelectionTier {
  /** Number of selections this tier applies to, as a string ("2", "3", ...) — matches the DB JSON shape. */
  selections: string;
  percentage_boost: number | string;
}

/** Live BB boost config loaded from settings_v2. */
export interface BBBoostConfig {
  enabled: boolean;
  selections: BBBoostSelectionTier[];
  max_award?: number;
}

/** Placement-time snapshot stored on `users_bets.bb_boost_rules`. */
export interface BBRulesSnapshot {
  percentage_boost: number | string;
  max_award?: number | string;
  [key: string]: unknown;
}

export interface CalculateBBBoostParams {
  /** Payout after BOG + Acca boost, before BB boost. */
  return_amount: number;
  /** Per-line stake (BB is single-line). */
  stake: number;
  /** Graded legs from user_bets_single. Every one must be a clean winner. */
  resultedSingleBets: BoostLeg[];
  /** Placement-time snapshot (preferred over live config). */
  snapshot?: BBRulesSnapshot | string | null;
  /** Live config fallback for legacy bets without a snapshot. */
  config?: BBBoostConfig | null;
}

/**
 * Returns the BB boost amount in cents-rounded units. 0 when not eligible.
 */
export function calculateBBBoost(params: CalculateBBBoostParams): number {
  const { return_amount, stake, resultedSingleBets, config } = params;
  const snapshot = parseRulesSnapshot<BBRulesSnapshot>(params.snapshot);

  if (!Array.isArray(resultedSingleBets) || resultedSingleBets.length === 0) return 0;

  const allCleanWinners = resultedSingleBets.every((leg) => String(leg?.result ?? '').toLowerCase() === 'winner');
  if (!allCleanWinners) return 0;

  const winnings = Number(return_amount) - Number(stake);
  if (!(winnings > 0)) return 0;

  let percentage = 0;
  let cap = 0;
  if (snapshot && Number(snapshot.percentage_boost) > 0) {
    percentage = Number(snapshot.percentage_boost) / 100;
    cap = Number(snapshot.max_award) || 0;
  } else if (config && config.enabled) {
    const match = (config.selections || []).find((s) => String(s.selections) === String(resultedSingleBets.length));
    if (match) {
      percentage = Number(match.percentage_boost) / 100;
      cap = Number(config.max_award) || 0;
    }
  }
  if (!(percentage > 0)) return 0;

  let amount = winnings * percentage;
  if (cap > 0 && amount > cap) amount = cap;
  return Math.round(amount * 100) / 100;
}
