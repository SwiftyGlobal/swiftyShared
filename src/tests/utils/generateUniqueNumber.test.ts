import { generateUniqueNumber } from '../../utils';

describe('generateUniqueNumber', () => {
  it('returns a positive unique number by default', () => {
    const result = generateUniqueNumber();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('returns a negative unique number when negative is true', () => {
    const result = generateUniqueNumber(true);
    expect(typeof result).toBe('number');
    expect(result).toBeLessThan(0);
  });

  it('always returns safe integers (within Number.MIN_SAFE_INTEGER..Number.MAX_SAFE_INTEGER) for many calls', () => {
    const results = Array.from({ length: 1000 }, () => generateUniqueNumber());
    for (const r of results) {
      expect(Number.isSafeInteger(r)).toBe(true);
      expect(r).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      expect(r).toBeGreaterThanOrEqual(Number.MIN_SAFE_INTEGER);
    }
  });

  it('always returns safe integers for many negative calls', () => {
    const results = Array.from({ length: 1000 }, () => generateUniqueNumber(true));
    for (const r of results) {
      expect(Number.isSafeInteger(r)).toBe(true);
      expect(r).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      expect(r).toBeGreaterThanOrEqual(Number.MIN_SAFE_INTEGER);
    }
  });
});
