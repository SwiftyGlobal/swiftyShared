import type { Nullable } from '../types';
import { generateOddsFormats } from './generateOddsFormats';
import type { BoostedPriceModel } from '../models';

/**
 * Retrieves the boosted price model for a selection based on decimal and fractional boosted prices.
 *
 * @param {Nullable<string>} decimalBoostedPrice - The boosted price in decimal format, or null if not available.
 * @param {Nullable<string>} fractionalBoostedPrice - The boosted price in fractional format, or null if not available.
 * @returns {Nullable<BoostedPriceModel>} The boosted price model containing decimal, fractional, and American odds, or null if input is invalid.
 */

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
