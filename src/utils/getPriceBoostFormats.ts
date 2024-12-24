import type { Nullable } from '../types';
import { generateOddsFormats } from './generateOddsFormats';
import type { BoostedPriceModel } from '../models';

export const getSelectionPriceBoost = (
  decimalBoostedPrice: Nullable<string>,
  fractionalBoostedPrice: Nullable<string>,
): Nullable<BoostedPriceModel> => {
  const {
    odds_fractional: fractional,
    odds_american: american,
    odds_decimal: decimal,
  } = generateOddsFormats(decimalBoostedPrice, fractionalBoostedPrice);

  return {
    decimal,
    fractional,
    american,
  };
};
