import { getSelectionPriceBoost } from '../../utils';
import { generateOddsFormats } from '../../utils';

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  generateOddsFormats: jest.fn(),
}));

describe('getSelectionPriceBoost', () => {
  it('should return boosted price model with formatted odds', () => {
    (generateOddsFormats as jest.Mock).mockReturnValue({
      odds_decimal: '2.50',
      odds_fractional: '3/2',
      odds_american: '+150',
    });

    const result = getSelectionPriceBoost('2.5', '3/2');

    expect(result).toEqual({
      decimal: '2.50',
      fractional: '3/2',
      american: '+150',
    });
  });

  it('should handle null inputs', () => {
    (generateOddsFormats as jest.Mock).mockReturnValue({
      odds_decimal: 'SP',
      odds_fractional: 'SP',
      odds_american: 'SP',
    });

    const result = getSelectionPriceBoost(null, null);

    expect(result).toEqual({
      decimal: 'SP',
      fractional: 'SP',
      american: 'SP',
    });
  });
});
