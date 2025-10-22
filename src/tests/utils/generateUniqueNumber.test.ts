import { generateUniqueNumber } from '../../utils/generateUniqueNumber';

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
});
