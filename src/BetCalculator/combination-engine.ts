/**
 * Pure combinatorics + odds arithmetic for betting multiples.
 * No knowledge of results, stakes, BOG, payout caps, or bet-type names.
 */

/**
 * All k-combinations of `items`, keeping only those where every pair is
 * compatible. Incompatible candidates are pruned during construction.
 */
export function generateCombinations<T>(items: T[], k: number, isCompatible?: (a: T, b: T) => boolean): T[][] {
  const result: T[][] = [];
  const build = (start: number, current: T[]) => {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < items.length; i++) {
      const candidate = items[i];
      if (isCompatible && current.some((chosen) => !isCompatible(chosen, candidate))) {
        continue;
      }
      current.push(candidate);
      build(i + 1, current);
      current.pop();
    }
  };
  if (k > 0 && k <= items.length) build(0, []);
  return result;
}

export interface CombinableLeg {
  event_id?: string;
  participant_id?: string | number;
  competition_id?: string;
  sport_slug?: string;
}

/** Two legs from the same event cannot combine (cross doubles/trebles rule). */
export function sameEventIncompatible(a: CombinableLeg, b: CombinableLeg): boolean {
  return a.event_id != null && a.event_id === b.event_id;
}

const hasParticipant = (l: CombinableLeg): boolean => l.participant_id != null && String(l.participant_id) !== '0';

/** Darts: two selections on the same participant cannot combine. */
export function sameParticipantIncompatible(a: CombinableLeg, b: CombinableLeg): boolean {
  return (
    a.sport_slug === 'darts' &&
    b.sport_slug === 'darts' &&
    hasParticipant(a) &&
    hasParticipant(b) &&
    a.participant_id === b.participant_id
  );
}

/** Compose incompatibility rules into one compatibility predicate. */
export function allCompatible<T>(...rules: Array<(a: T, b: T) => boolean>): (a: T, b: T) => boolean {
  return (a, b) => !rules.some((rule) => rule(a, b));
}

/** Product of decimal odds. Caller resolves void→1 and loser→0 before calling. */
export function multiplyOdds(odds: number[]): number {
  return odds.reduce((acc, o) => acc * o, 1);
}

/** Each-way place odd: (winOdd - 1) * (ewNumerator/ewDenominator) + 1. */
export function eachWayPlaceOdd(winOdd: number, ewTerms: string): number {
  if (!ewTerms || !ewTerms.includes('/')) return winOdd;
  const [num, den] = ewTerms.split('/');
  return (winOdd - 1) * (+num / +den) + 1;
}

export interface PriceableLeg extends CombinableLeg {
  odd: number;
  ew_terms?: string;
  starting_price?: boolean;
}

export interface PricedFold {
  noOfCombinations: number;
  totalOdds: number;
  totalPlaceOdds: number;
}

/**
 * Pre-settlement pricing: combination count + summed win/place odds across all
 * k-combinations. Mirrors GamingBackend's generateNFolds output.
 */
export function priceCombinations(
  legs: PriceableLeg[],
  k: number,
  opts: { eachWay?: boolean; isCompatible?: (a: PriceableLeg, b: PriceableLeg) => boolean } = {},
): PricedFold {
  const eachWay = opts.eachWay ?? false;
  const combos = generateCombinations(legs, k, opts.isCompatible);

  let totalOdds = 0;
  let totalPlaceOdds = 0;
  for (const combo of combos) {
    const winOdds = combo.map((leg) => (leg.starting_price ? 0 : leg.odd));
    totalOdds += multiplyOdds(winOdds);
    if (eachWay) {
      const placeOdds = combo.map((leg) =>
        leg.starting_price ? 0 : leg.ew_terms ? eachWayPlaceOdd(leg.odd, leg.ew_terms) : 1,
      );
      totalPlaceOdds += multiplyOdds(placeOdds);
    }
  }
  return { noOfCombinations: combos.length, totalOdds, totalPlaceOdds };
}
