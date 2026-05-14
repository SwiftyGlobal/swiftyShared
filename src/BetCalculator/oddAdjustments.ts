/**
 * Pure odd-math helpers shared by the auto-settle worker
 * (swiftyPredictionsELBAPI) and the manual-settle CMS (SwiftyPredictionsCMSEB).
 *
 * No DB, no logging, no side-effects.
 */

/**
 * Apply Rule 4 (non-runner deduction) to a decimal odd.
 *
 * Formula: `odd' = 1 + (odd - 1) × (1 - r4/100)`
 *
 * - Returns 0 when the input odd is non-positive.
 * - Returns the original odd unchanged when r4 ≤ 0 (no deduction).
 * - r4 is the deduction percentage as a number (e.g. `25` for 25%).
 */
export function oddAfterRule4(params: {
  odd: number | string;
  rule4_percentage: number | string | null | undefined;
}): number {
  const numOdd = Number(params.odd) || 0;
  const r4 = Number(params.rule4_percentage) || 0;
  if (numOdd <= 0) return 0;
  if (r4 <= 0) return numOdd;
  return 1 + (numOdd - 1) * (1 - r4 / 100);
}

/**
 * Resolve the starting-price odd to use for settlement, honouring an explicit
 * provider-supplied SP+R4 value when present.
 *
 * Some providers (BetRadar / SIS) deliver the SP-after-R4 directly via
 * `rule4_bog_odd`; when that's non-zero we use it as-is (it already encodes
 * the deduction). Otherwise we apply Rule 4 to the raw SP ourselves.
 */
export function spOddAfterRule4(params: {
  starting_price_odd: number | string;
  rule4_percentage: number | string | null | undefined;
  rule4_bog_odd?: number | string | null | undefined;
}): number {
  const rule4BogOdd = Number(params.rule4_bog_odd) || 0;
  if (rule4BogOdd > 0) return rule4BogOdd;
  return oddAfterRule4({
    odd: params.starting_price_odd,
    rule4_percentage: params.rule4_percentage,
  });
}
