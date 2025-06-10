import { decimalToFractional } from '../../utils';

jest.mock('../../common', () => ({
  oddsConversionV2: {
    2.0: '1/1',
    2.5: '6/4',
    3.0: '2/1',
  },
  oddsConversion: {
    2.0: '1/1',
    2.5: '6/4',
    3.0: '2/1',
  },
  oddsKeys: ['2.0', '2.5', '3.0'],
}));

describe('decimalToFractional', () => {
  it('should return SP for 0', () => {
    expect(decimalToFractional(0)).toBe('SP');
  });

  it('should return predefined fractional value for exact match', () => {
    expect(decimalToFractional(2.0)).toBe('1/1');
    expect(decimalToFractional(2.5)).toBe('6/4');
  });

  it('should convert whole number to fractional', () => {
    expect(decimalToFractional(4)).toBe('3/1');
    expect(decimalToFractional(1)).toBe('0/1');
  });

  it('should return closest lower oddsConversion value when not exact', () => {
    expect(decimalToFractional(2.4)).toBe('1/1'); // Closest lower: 2.0
    expect(decimalToFractional(2.6)).toBe('6/4'); // Closest lower: 2.5
  });

  it('should return value*100/100 when value exceeds known keys', () => {
    expect(decimalToFractional(4.25)).toBe('425/100');
  });
});
