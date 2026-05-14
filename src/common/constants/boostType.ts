/**
 * Boost tag identifiers used on `users_bets.tags` (comma-separated string).
 * Tag presence is the placement-time gate: a bet must carry the matching tag
 * to be eligible for that boost at settlement, regardless of the player's
 * current bet_enhancements_enabled flag.
 *
 * Single source of truth so the worker (auto-settle) and CMS (manual-settle)
 * never drift on string literals.
 */
export enum BoostType {
  ACCA = 'ACCA_BOOST',
  BB = 'BB_BOOST',
  LUCKY = 'LUCKY_BOOST',
  BOG = 'BOG',
}
