import { generateCombinations } from '../../BetCalculator/combination-engine';

describe('generateCombinations', () => {
  it('returns all C(n,k) when no predicate', () => {
    expect(generateCombinations([1, 2, 3, 4], 2).length).toBe(6);
    expect(generateCombinations([1, 2, 3, 4], 3).length).toBe(4);
  });
  it('returns [] when k > n', () => {
    expect(generateCombinations([1, 2], 3)).toEqual([]);
  });
  it('preserves order within each combination', () => {
    expect(generateCombinations([1, 2, 3], 2)).toEqual([[1, 2], [1, 3], [2, 3]]);
  });
  it('drops pairs the predicate rejects', () => {
    // reject combos containing two evens
    const isCompat = (a: number, b: number) => !(a % 2 === 0 && b % 2 === 0);
    expect(generateCombinations([2, 4, 1, 3], 2)).toBeDefined();
    const r = generateCombinations([2, 4, 1, 3], 2, isCompat);
    expect(r).not.toContainEqual([2, 4]);
    expect(r.length).toBe(5); // 6 total minus [2,4]
  });
});
