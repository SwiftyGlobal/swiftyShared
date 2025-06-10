import { generateOddsFormats } from '../../utils';

jest.mock('../../utils/numberFormatter', () => ({
  numberFormatter: (value: number) => value.toFixed(2),
}));

jest.mock('../../utils/decimalToFractional', () => ({
  decimalToFractional: (value: number) => `fractional-${value}`,
}));

jest.mock('../../utils/decimalToAmerican', () => ({
  decimalToAmerican: (value: number) => `american-${value}`,
}));

describe('generateOddsFormats', () => {
  it('should return SP for all formats if inputs are null or 0', () => {
    expect(generateOddsFormats(null, null)).toEqual({
      odds_decimal: 'SP',
      odds_american: 'SP',
      odds_fractional: 'SP',
    });

    expect(generateOddsFormats('0', null)).toEqual({
      odds_decimal: 'SP',
      odds_american: 'SP',
      odds_fractional: 'SP',
    });
  });

  it('should convert fractional odds to decimal and other formats', () => {
    const result = generateOddsFormats(null, '3/2');
    // 3/2 = 1.5 + 1 = 2.5
    expect(result.odds_decimal).toBe('2.50');
    expect(result.odds_fractional).toBe('3/2');
    expect(result.odds_american).toBe('american-2.5');
  });

  it('should convert decimal odds to all formats when fractional is not provided', () => {
    const decimalInput = '2.75';
    const expectedDecimal = '2.75'; // from mocked numberFormatter
    const result = generateOddsFormats(decimalInput, null);

    expect(result.odds_decimal).toBe(expectedDecimal);
    expect(result.odds_fractional).toBe('fractional-2.75');
    expect(result.odds_american).toBe('american-2.75');
  });

  it('should return SP if decimal number parsed is zero', () => {
    const result = generateOddsFormats('0', null);
    expect(result).toEqual({
      odds_decimal: 'SP',
      odds_american: 'SP',
      odds_fractional: 'SP',
    });
  });
});
