/**
 * FROZEN reference: verbatim port of ELBAPI full per-leg resolution math.
 *
 * Sources:
 *   - settlement.utils.js applyMultipleResultAdjustments (lines 75-113):
 *       dead-heat: adjustedOdd = odd * (partialPercent / 100)  where partialPercent = 100 / tieCount
 *       originalOdd is saved as the PRE-dead-heat odd (singleBet.odd before DH adjustment).
 *   - settlement.utils.js oddAfterRule4 / re-exported from @swiftyglobal/swifty-shared:
 *       odd' = 1 + (odd - 1) * (1 - r4/100)
 *   - playbookResultMultiples.js BOG logic (lines 369-401):
 *       placed_odd_original = originalOdd ?? odd   ← PRE-dead-heat
 *       sp_odd_original     = originalSpOdd ?? sp_odd
 *       placed_odd_with_r4  = r4>0 ? oddAfterRule4(placed_odd_original, r4) : placed_odd_original
 *       if sp_odd_original > placed_odd_with_r4 → use dead-heat-adjusted sp_odd
 *       else                                    → apply dead-heat ratio to placed_odd_with_r4
 *       bog_amount_won = SUM over legs of: (BOG combination return − R4 combination return)
 *   - playbookResultMultiples.js R4 path (lines 404-413):
 *       baseOdd = row.originalOdd ?? row.odd   ← originalOdd = PRE-dead-heat raw odd
 *       row.odd = oddAfterRule4(baseOdd, r4)   ← R4 applied to PRE-dead-heat odd
 *       Dead-heat is then applied after R4: r4WinOdd * (partial / 100) when partial > 0.
 *       Correct order: R4(rawOdd) → then dead-heat factor.  NOT R4(deadHeated_odd).
 *   - playbookMultiple.js combination math (getDoubleReturnAmountWithWinners / getNFoldReturnAmountWithWinners):
 *       gross_win  = Π(odd_i) × stake
 *       gross_place (if EW) = Π(place_odd_i) × stake
 *       gross_total = gross_win + gross_place
 *
 * Dead-heat ↔ BetCalculator mapping (empirical):
 *   ELBAPI partialPercent = 100 / numberOfTyingRunners.
 *   BetCalculator partial_win_percent maps to ELBAPI as:
 *     partial_win_percent = 100 - partialPercent
 *   (For 2-way: 100-50=50, coincidentally equal; for 3-way: 100-33.33=66.67; for 4-way: 100-25=75.)
 *
 * This file is the ORACLE for task-A1.  Do not change the math to match the engine;
 * fix the engine if it diverges from this reference.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface DeepLeg {
  /** Decimal odd as placed (before R4, before dead-heat). */
  odd_decimal: number;
  /** Decimal SP odd (used for BOG comparison; no R4 applied to SP). */
  sp_odd_decimal?: number;
  /** Result of this selection. */
  result: 'winner' | 'placed' | 'void' | 'push' | 'pushed' | 'loser';
  /** Rule-4 deduction percentage (0 = none). */
  rule_4?: number;
  /** Whether BOG applies to this selection. */
  bog_applicable?: boolean;
  /**
   * Dead-heat partial percent as used in ELBAPI: 100 / numberOfHorsesTying.
   * E.g. a 2-way dead heat → partial_percent = 50.
   * 0 = no dead heat.
   */
  partial_percent?: number;
  /** EW terms string e.g. "1/4". */
  ew_terms?: string;
}

export interface DeepSettleResult {
  /** Gross total return (including stake return). */
  return: number;
  /** BOG top-up amount (0 when BOG not applicable or placed odd was better). */
  bog_amount_won: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** oddAfterRule4 — exact formula from @swiftyglobal/swifty-shared / settlement.utils.js */
function oddAfterRule4(odd: number, r4: number): number {
  if (odd <= 0) return 0;
  if (r4 <= 0) return odd;
  return 1 + (odd - 1) * (1 - r4 / 100);
}

/** Parse "n/d" EW-terms string; returns the fraction (n/d). */
function parseEwFraction(ewTerms?: string): number {
  if (!ewTerms || !ewTerms.includes('/')) return 1;
  const [n, d] = ewTerms.split('/');
  return +n / +d;
}

/** Derive EW place odd from win odd: (win_odd - 1) * fraction + 1 */
function placeOdd(winOdd: number, fraction: number): number {
  return (winOdd - 1) * fraction + 1;
}

// ── Per-leg resolution ───────────────────────────────────────────────────────

/**
 * Resolve a single leg to the odds used for the regular-path (R4-applied placed odd)
 * and the BOG-path (best of R4-placed vs raw SP), matching ELBAPI's two-pass logic.
 *
 * Returns `null` for a loser (excluded from combinations, gross contribution = 0).
 * Returns `{ odd: 1, place_odd: 1 }` for void/push (neutral multiplier).
 */
interface ResolvedLeg {
  /** Win odd for the R4 path (used in baseline combination). */
  r4Odd: number;
  /** Win odd for the BOG path (SP or R4-placed, whichever is better). */
  bogOdd: number;
  /** EW place odd for R4 path. */
  r4PlaceOdd: number;
  /** EW place odd for BOG path. */
  bogPlaceOdd: number;
  isVoid: boolean;
  isLoser: boolean;
}

function resolveLeg(leg: DeepLeg, eachWay: boolean): ResolvedLeg {
  const result = leg.result.toLowerCase();
  const isVoid = result === 'void' || result === 'push' || result === 'pushed';
  const isLoser = result === 'loser';
  const isWinner = result === 'winner';
  const isPlaced = result === 'placed';

  if (isVoid) {
    return { r4Odd: 1, bogOdd: 1, r4PlaceOdd: 1, bogPlaceOdd: 1, isVoid: true, isLoser: false };
  }
  if (isLoser) {
    return { r4Odd: 0, bogOdd: 0, r4PlaceOdd: 0, bogPlaceOdd: 0, isVoid: false, isLoser: true };
  }

  const rawOdd = leg.odd_decimal;
  const r4 = leg.rule_4 ?? 0;
  const partial = leg.partial_percent ?? 0;
  const spOdd = leg.sp_odd_decimal ?? 0;
  const bogApplicable = !!leg.bog_applicable;

  // ── Dead-heat step (settlement.utils.js line 97) ──────────────────────────
  // ELBAPI applies dead-heat as: adjustedOdd = odd * (partialPercent / 100)
  // Only applied when the selection is winner or placed (already ensured above).
  let deadHeated_odd = rawOdd;
  let deadHeated_sp = spOdd;
  if (partial > 0 && partial < 100) {
    deadHeated_odd = rawOdd * (partial / 100);
    if (spOdd > 0) deadHeated_sp = spOdd * (partial / 100);
  }

  // ── BOG path (playbookResultMultiples.js lines 373-399) ───────────────────
  // Compare R4-applied placed odd vs raw SP odd (no R4 on SP).
  // originalOdd = rawOdd (pre dead-heat), sp_odd_original = spOdd (pre dead-heat).
  const placed_odd_with_r4 = r4 > 0 ? oddAfterRule4(rawOdd, r4) : rawOdd;
  let bogWinOdd: number;
  if (bogApplicable && spOdd > 0 && spOdd > placed_odd_with_r4) {
    // SP wins: use dead-heat-adjusted SP odd
    bogWinOdd = deadHeated_sp;
  } else if (bogApplicable) {
    // Placed-with-R4 wins: apply dead-heat ratio to R4 value
    if (partial > 0 && partial < 100 && rawOdd !== deadHeated_odd) {
      const deadHeatRatio = deadHeated_odd / rawOdd;
      bogWinOdd = placed_odd_with_r4 * deadHeatRatio;
    } else {
      bogWinOdd = placed_odd_with_r4;
    }
  } else {
    // BOG not applicable — use R4 path: R4(rawOdd), then apply dead-heat factor.
    // Mirrors R4 path (lines 404-413): baseOdd = originalOdd (pre-dead-heat), R4 applied to that.
    // Dead-heat is then re-applied as a factor after R4.
    const r4Base = r4 > 0 ? oddAfterRule4(rawOdd, r4) : rawOdd;
    bogWinOdd = (partial > 0 && partial < 100) ? r4Base * (partial / 100) : r4Base;
  }

  // ── R4 path (playbookResultMultiples.js lines 404-413) ────────────────────
  // baseOdd = row.originalOdd ?? row.odd  — originalOdd is the PRE-dead-heat raw odd,
  // saved by applyMultipleResultAdjustments (settlement.utils.js line 107).
  // Correct order: R4 is applied to rawOdd (pre-dead-heat), THEN dead-heat factor applied.
  // This is NOT R4(deadHeated_odd) — that was the previous (wrong) implementation.
  const r4Base = r4 > 0 ? oddAfterRule4(rawOdd, r4) : rawOdd;
  const r4WinOdd = (partial > 0 && partial < 100) ? r4Base * (partial / 100) : r4Base;

  // ── EW place odds ─────────────────────────────────────────────────────────
  const fraction = parseEwFraction(leg.ew_terms);
  let r4PlaceOdd = 0;
  let bogPlaceOdd = 0;

  if (eachWay) {
    if (isWinner) {
      r4PlaceOdd = placeOdd(r4WinOdd, fraction);
      bogPlaceOdd = placeOdd(bogWinOdd, fraction);
    } else if (isPlaced) {
      // placed-only: win odd = 0, place_odd = placeOdd(raw placed odd with R4/dead-heat)
      r4PlaceOdd = placeOdd(r4WinOdd, fraction);
      bogPlaceOdd = placeOdd(bogWinOdd, fraction);
    }
    // void: place_odd = 1 (already handled above)
  }

  // For placed legs in non-EW: contribution is 0 (loser-equivalent).
  // But for EW placed legs, the win_odd in combination is 0 and place_odd is non-zero.
  const effectiveR4WinOdd = isPlaced && eachWay ? 0 : r4WinOdd;
  const effectiveBogWinOdd = isPlaced && eachWay ? 0 : bogWinOdd;

  return {
    r4Odd: effectiveR4WinOdd,
    bogOdd: effectiveBogWinOdd,
    r4PlaceOdd,
    bogPlaceOdd,
    isVoid: false,
    isLoser: false,
  };
}

// ── Combination computation ──────────────────────────────────────────────────

/** All k-combinations from an array. */
function kCombinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const loop = (start: number, depth: number, acc: T[]) => {
    if (depth === 0) { result.push(acc); return; }
    for (let i = start; i <= arr.length - depth; i++) {
      loop(i + 1, depth - 1, [...acc, arr[i]]);
    }
  };
  loop(0, k, []);
  return result;
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Reproduce ELBAPI's full per-leg resolution and combination math.
 *
 * @param legs         Array of per-leg descriptors.
 * @param betType      'double' | 'treble' | 'fold4' | 'trixie'
 * @param stake        Stake per line.
 * @param eachWay      Whether this is an each-way bet.
 * @returns            { return, bog_amount_won } — return is the gross total (includes stake).
 */
export function referenceDeepSettle(
  legs: DeepLeg[],
  betType: 'double' | 'treble' | 'fold4' | 'trixie',
  stake: number,
  eachWay: boolean,
): DeepSettleResult {
  const resolved = legs.map((l) => resolveLeg(l, eachWay));

  // Determine combination sizes for this bet type
  type ComboSpec = { size: number; count?: number }; // count for validation only
  const specs: number[] = [];
  if (betType === 'double') specs.push(2);
  else if (betType === 'treble') specs.push(3);
  else if (betType === 'fold4') specs.push(4);
  else if (betType === 'trixie') { specs.push(2); specs.push(3); }

  let totalR4Return = 0;
  let totalBogReturn = 0;

  for (const size of specs) {
    const combos = kCombinations(resolved, size);
    for (const combo of combos) {
      // Skip combinations that contain a loser — they return 0 regardless
      if (combo.some((l) => l.isLoser)) continue;
      const r4 = combReturnFromResolvedLegs(combo, stake, eachWay, false);
      const bog = combReturnFromResolvedLegs(combo, stake, eachWay, true);
      totalR4Return += r4;
      totalBogReturn += bog;
    }
  }

  const bog_amount_won = Math.max(0, totalBogReturn - totalR4Return);

  return {
    return: totalR4Return,
    bog_amount_won,
  };
}

/**
 * Compute the gross return for a single k-combination of resolved legs.
 *
 * Mirrors playbookMultiple.js getNFoldReturnAmountWithWinners / getDoubleReturnAmountWithWinners:
 *   winReturn   = Π(odd_i) × stake
 *   placeReturn = Π(place_odd_i) × stake  (only if EW)
 *   gross       = winReturn + placeReturn
 */
function combReturnFromResolvedLegs(
  legs: ResolvedLeg[],
  stake: number,
  eachWay: boolean,
  useBog: boolean,
): number {
  let winProduct = 1;
  let placeProduct = 1;

  for (const leg of legs) {
    if (leg.isLoser) return 0;
    const wo = useBog ? leg.bogOdd : leg.r4Odd;
    winProduct *= wo;
    if (eachWay) {
      const po = useBog ? leg.bogPlaceOdd : leg.r4PlaceOdd;
      placeProduct *= po;
    }
  }

  const winReturn = winProduct * stake;
  const placeReturn = eachWay ? placeProduct * stake : 0;
  return winReturn + placeReturn;
}
