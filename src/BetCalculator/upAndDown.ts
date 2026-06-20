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
  /** Did the place part succeed (placed or better)? Used only when eachWay. */
  placed: boolean;
  /** Non-runner: the single returns its stake; effective odds become 1.0 and it counts as a success. */
  isVoid: boolean;
  /** Dead-heat fraction in (0,1]; null = full odds. Shrinks the profit fraction of the effective odds. */
  deadHeatFraction: number | null;
}

const effectiveOdds = (leg: UpAndDownLeg, baseOdds: number): number => {
  if (leg.isVoid) return 1;
  const fraction = leg.deadHeatFraction == null ? 1 : leg.deadHeatFraction;
  return 1 + (baseOdds - 1) * fraction;
};

/**
 * Return for one direction: Part 1 = part1, any-to-come a single on Part 2 = part2.
 * `getOdds` selects winOdds or placeOdds; `getSuccess` selects won or placed.
 */
const directionReturn = (
  part1: UpAndDownLeg,
  part2: UpAndDownLeg,
  unit: number,
  multiplier: number,
  getOdds: (l: UpAndDownLeg) => number,
  getSuccess: (l: UpAndDownLeg) => boolean,
): number => {
  const part1Success = part1.isVoid || getSuccess(part1);
  if (!part1Success) return 0;

  const part1Return = unit * effectiveOdds(part1, getOdds(part1));
  const atcStake = Math.min(multiplier * unit, part1Return);
  const leftover = part1Return - atcStake;

  const part2Success = part2.isVoid || getSuccess(part2);
  const atcReturn = part2Success ? atcStake * effectiveOdds(part2, getOdds(part2)) : 0;
  return leftover + atcReturn;
};

const partReturn = (
  legA: UpAndDownLeg,
  legB: UpAndDownLeg,
  unit: number,
  multiplier: number,
  getOdds: (l: UpAndDownLeg) => number,
  getSuccess: (l: UpAndDownLeg) => boolean,
): number =>
  directionReturn(legA, legB, unit, multiplier, getOdds, getSuccess) +
  directionReturn(legB, legA, unit, multiplier, getOdds, getSuccess);

/**
 * Gross (stake-inclusive) return for one Up-and-Down pair.
 *
 * SSA: Part-2 ATC stake = min(unit, Part-1 return).
 * DSA: Part-2 ATC stake = min(2*unit, Part-1 return).
 * Each-way: win part (win odds, won) + place part (place odds, placed), each with its own ATC cap.
 */
export const calculateUpAndDownReturn = (
  style: UpAndDownStyle,
  legA: UpAndDownLeg,
  legB: UpAndDownLeg,
  unitStake: number,
  eachWay: boolean,
): number => {
  const multiplier = style === 'dsa' ? 2 : 1;

  const winPart = partReturn(
    legA,
    legB,
    unitStake,
    multiplier,
    (l) => l.winOdds,
    (l) => l.won,
  );

  if (!eachWay) return winPart;

  const placePart = partReturn(
    legA,
    legB,
    unitStake,
    multiplier,
    (l) => l.placeOdds,
    (l) => l.placed,
  );

  return winPart + placePart;
};
