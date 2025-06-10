import { decimalToAmerican } from '../../utils';

describe('decimalToAmerican', () => {
  it('should return correct positive American odds for value > 2', () => {
    expect(decimalToAmerican(3)).toBe('+200');
    expect(decimalToAmerican(2.5)).toBe('+150');
  });

  it('should return correct negative American odds for 1 < value < 2', () => {
    expect(decimalToAmerican(1.5)).toBe('-200');
    expect(decimalToAmerican(1.3)).toBe('-333');
  });

  it('should return "+100" for value exactly 2 (evens)', () => {
    expect(decimalToAmerican(2)).toBe('+100');
  });

  it('should handle value less than 1 and return result according to formula (may have double minus)', () => {
    expect(decimalToAmerican(0.5)).toBe('--200');
  });

  it('should handle value equal to 1 (division by zero) resulting in "-Infinity"', () => {
    expect(decimalToAmerican(1)).toBe('-Infinity');
  });

  it('should handle zero and negative values correctly', () => {
    expect(decimalToAmerican(0)).toBe('--100');
    expect(decimalToAmerican(-1)).toBe('--50');
  });

  it('should handle values just below 2', () => {
    expect(decimalToAmerican(1.9999)).toBe('-100');
  });

  it('should handle values just above 2', () => {
    expect(decimalToAmerican(2.0001)).toBe('+100');
  });
});
