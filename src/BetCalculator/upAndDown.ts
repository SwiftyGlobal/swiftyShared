export type UpAndDownStyle = 'ssa' | 'dsa';

/**
 * A resolved leg of an Up-and-Down pair. Odds are decimal and already resolved
 * (the caller maps ew_terms -> placeOdds and SP/fractional -> decimal).
 */
export interface UpAndDownLeg {
  /** Decimal win odds (e.g. 3.0). Ignored when the leg is void. */
  winOdds: number;
  /** Decimal place odds for each-way (e.g. 2.0). Ignored when eachWay=false or void. */
  placeOdds: number;
  /** Did the win part succeed? A dead-heat win counts as won (with deadHeatFraction set). */
  won: boolean;
  /** Did the place part succeed (placed or better)? A winning leg is always treated as placed. Used only when eachWay. */
  placed: boolean;
  /** Non-runner: the single returns its stake; effective odds become 1.0 and it counts as a success. */
  isVoid: boolean;
  /** Dead-heat fraction in (0,1]; null = full odds. Divides the stake: 1/N of stake at full odds (return = odds × fraction). */
  deadHeatFraction: number | null;
}

/** Effective decimal odds for a resolved leg: void -> 1.0; dead-heat shrinks the odds. */
const effectiveOdds = (leg: UpAndDownLeg, baseOdds: number): number => {
  if (leg.isVoid) return 1;
  const fraction = leg.deadHeatFraction == null ? 1 : leg.deadHeatFraction;
  return baseOdds * fraction;
};

/**
 * Return for ONE direction of an Up-and-Down: part-1 is a single on legA whose
 * return rolls over (any-to-come) onto a single on legB.
 *
 * Win-only: part-1 is a win single; the ATC stake (capped at multiplier*unit)
 * funds a win single on legB.
 *
 * Each-way (AceOdds "single each-way ATC"): part-1 is an EACH-WAY single on legA,
 * so its return is win-return (if won) PLUS place-return (if placed). That combined
 * return rolls over, capped at the each-way ATC stake = 2*multiplier*unit
 * (multiplier*unit for the win part + multiplier*unit for the place part). The
 * rolled stake is placed as an each-way single on legB (half win, half place).
 * A leg that only PLACES (did not win) still produces a return and still rolls over.
 */
const directionReturn = (
  part1: UpAndDownLeg,
  part2: UpAndDownLeg,
  unit: number,
  multiplier: number,
  eachWay: boolean,
): number => {
  const p1Won = part1.isVoid || part1.won;
  const p1Placed = part1.isVoid || part1.placed || part1.won;

  let part1Return = 0;
  if (p1Won) part1Return += unit * effectiveOdds(part1, part1.winOdds);
  if (eachWay && p1Placed) part1Return += unit * effectiveOdds(part1, part1.placeOdds);
  if (part1Return <= 0) return 0;

  const atcCap = (eachWay ? 2 : 1) * multiplier * unit;
  const atcStake = Math.min(atcCap, part1Return);
  const leftover = part1Return - atcStake;

  const p2Won = part2.isVoid || part2.won;
  const p2Placed = part2.isVoid || part2.placed || part2.won;

  let atcReturn = 0;
  if (eachWay) {
    const halfStake = atcStake / 2;
    if (p2Won) atcReturn += halfStake * effectiveOdds(part2, part2.winOdds);
    if (p2Placed) atcReturn += halfStake * effectiveOdds(part2, part2.placeOdds);
  } else if (p2Won) {
    atcReturn += atcStake * effectiveOdds(part2, part2.winOdds);
  }

  return leftover + atcReturn;
};

/**
 * Gross (stake-inclusive) return for one Up-and-Down pair (both directions).
 *
 * SSA: ATC stake multiplier = 1. DSA: multiplier = 2.
 * Each-way is a single each-way any-to-come (see directionReturn): the winning/
 * placed leg's full each-way return funds an each-way single on the other leg.
 */
export const calculateUpAndDownReturn = (
  style: UpAndDownStyle,
  legA: UpAndDownLeg,
  legB: UpAndDownLeg,
  unitStake: number,
  eachWay: boolean,
): number => {
  const multiplier = style === 'dsa' ? 2 : 1;
  return (
    directionReturn(legA, legB, unitStake, multiplier, eachWay) +
    directionReturn(legB, legA, unitStake, multiplier, eachWay)
  );
};
