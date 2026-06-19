/**
 * Pure combinatorics + odds arithmetic for betting multiples.
 * No knowledge of results, stakes, BOG, payout caps, or bet-type names.
 */

/**
 * All k-combinations of `items`, keeping only those where every pair is
 * compatible. Incompatible candidates are pruned during construction.
 */
export function generateCombinations<T>(
  items: T[],
  k: number,
  isCompatible?: (a: T, b: T) => boolean,
): T[][] {
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

const hasParticipant = (l: CombinableLeg): boolean =>
  l.participant_id != null && String(l.participant_id) !== '0';

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
export function allCompatible<T>(
  ...rules: Array<(a: T, b: T) => boolean>
): (a: T, b: T) => boolean {
  return (a, b) => !rules.some((rule) => rule(a, b));
}
