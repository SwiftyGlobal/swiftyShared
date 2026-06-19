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
