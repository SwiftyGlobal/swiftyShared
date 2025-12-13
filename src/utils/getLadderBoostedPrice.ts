import Decimal from 'decimal.js';

import type { LadderValues } from '../types';
import type { GetLadderBoostedPriceV2Dto } from '../common';
import { oddsKeys, PriceBoostTypes } from '../common';
import type { LadderModel } from '../models';
import { parseLadderValue } from './parseLadderValue';
import { stripDecimal } from './stripDecimal';

/**
 * @deprecated - No longer used since ladders are dynamic. Do not use this function and replace with getLadderBoostedPriceV2.
 * @description - Get the ladder boosted price. If the decimal is not available or ladder is -1, return 0.
 * @param ladder - The ladder value to be used for the calculation of the boosted price. E.g. ladder+1, ladder+2, ladder+3, ladder+4 or -1.
 * @param decimal - The original decimal value to be used for the calculation of the boosted price.
 * @returns - The boosted **decimal** price based on the ladder and the decimal.
 * @example
 * getLadderBoostedPrice('ladder+1', 1.5); // 1.66667
 * getLadderBoostedPrice('ladder+2', 1.5); // 1.7
 * getLadderBoostedPrice('ladder+3', 1.5); // 1.72727
 * getLadderBoostedPrice('ladder+4', 2.8); // 3.1
 */
/* istanbul ignore next */
export const getLadderBoostedPrice = (ladder: LadderValues, decimal: number): number => {
  if (!decimal || ladder === '-1') {
    return 0;
  }

  const [, ladderValue] = ladder.split('+');

  const foundOddsKeys: number[] = oddsKeys.filter((oddKey) => oddKey > +decimal);

  if (!foundOddsKeys.length) {
    return decimal;
  }

  if (foundOddsKeys.length >= +ladderValue - 1) {
    return parseFloat(String(foundOddsKeys[+ladderValue - 1]));
  }

  return parseFloat(String(foundOddsKeys[foundOddsKeys.length - 1]));
};

/**
 * @deprecated - No longer used since we added a price boost type to indicate whether the price boost standard or super boost. Replace with getLadderBoostedPriceV3.
 */
/* istanbul ignore next */
export const getLadderBoostedPriceV2 = (payload: GetLadderBoostedPriceV2Dto): number => {
  const { sportSlug, decimal, ladderValue, laddersMap } = payload;

  /**
   * @description - If the decimal is not available or ladder is -1, return 0.
   */
  if (!decimal || ladderValue === '-1') {
    return 0;
  }

  // Get the ladders based on the sportSlug.
  // If the ladders are not available, use the master ladders.
  const ladders = laddersMap.get(sportSlug) || laddersMap.get('master');

  /**
   * @description - If the ladders are not available, return 0.
   */
  if (!ladders) {
    return 0;
  }

  /**
   * @description - Get the ladder value from the ladderValue.
   * @example
   * - If the ladderValue is 'ladder+1', then the ladder is 1.
   * - If the ladderValue is 'ladder+2', then the ladder is 2.
   * - If the ladderValue is 'ladder+3', then the ladder is 3.
   * - If the ladderValue is 'ladder+4', then the ladder is 4.
   * - If the ladderValue is '-1', then the ladder is -1.
   */
  const [, ladder] = ladderValue.split('+');

  const foundLadders = ladders.filter((x) => +x.in_decimal > +decimal);

  const foundActualLadder =
    foundLadders?.length >= +ladder - 1 ? foundLadders[+ladder - 1] : foundLadders[foundLadders?.length - 1];

  if (!foundActualLadder) {
    return 0;
  }

  return parseFloat(foundActualLadder.in_decimal);
};

/**
 * @description - Works almost the same as getLadderBoostedPriceV2, but instead returns an object with price boost type
 * Also supports negative ladders and super boosts.
 */
export const getLadderBoostedPriceV3 = (
  payload: GetLadderBoostedPriceV2Dto,
): { decimal: number; price_boost_type: PriceBoostTypes; fractional: string } => {
  const { sportSlug, decimal: originalDecimalOdd, ladderValue, laddersMap } = payload;

  /**
   * @description - If the decimal is not available or ladder is -1, return 0.
   */
  if (!originalDecimalOdd || ladderValue === '-1') {
    return { decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD };
  }

  const decimal = stripDecimal(originalDecimalOdd);

  // Get the ladders based on the sportSlug.
  // If the ladders are not available, use the master ladders.
  const ladders = laddersMap.get(sportSlug) || laddersMap.get('master');

  /**
   * @description - If the ladders are not available, return 0.
   */
  if (!ladders) {
    return { decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD };
  }

  /**
   * @description - Get the ladder value from the ladderValue.
   * @example
   * - If the ladderValue is 'ladder+1', then the ladder is 1.
   * - If the ladderValue is 'ladder+2', then the ladder is 2.
   * - If the ladderValue is 'ladder+3', then the ladder is 3.
   * - If the ladderValue is 'ladder+4', then the ladder is 4.
   * - If the ladderValue is '-1', then the ladder is -1.
   */
  const { ladder, isNegative } = parseLadderValue(ladderValue);

  const ladderNumber = +ladder;

  const foundLadders = ladders.filter((x) => {
    const laddersDecimal = new Decimal(x.in_decimal);

    return isNegative ? laddersDecimal.lessThan(decimal) : laddersDecimal.greaterThan(decimal);
  });

  if (isNegative) {
    foundLadders.reverse();
  }

  let ladderIndex = ladderNumber;

  let foundActualLadder: LadderModel;

  if (foundLadders?.length > ladderNumber - 1) {
    foundActualLadder = foundLadders[ladderNumber - 1];
  } else {
    foundActualLadder = foundLadders[foundLadders?.length - 1];

    ladderIndex = foundLadders?.length;
  }

  if (!foundActualLadder) {
    return { decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD };
  }

  /**
   * @description
   * If ladder is negative - no price boost.
   * Otherwise:
   * If the ladder index is less than or equal to 3, then the price boost type is 'boost'.
   * There can be a case when ladder is +4 but the ladders amount above the current decimal is less than 4.
   * In that case, we must take the latest value with its index and replace ladder+4 with ladder+index.
   * Also, if ladder is negative, it's always standard boost.
   * @example
   * // current ladders - [1.5, 1.6, 1.7, 1.8, 1.9];
   * const decimal = 1.8;
   * const ladder = 'ladder+5';
   * getLadderBoostedPriceV3({ sportSlug: 'football', decimal, ladder, laddersMap: new Map() }); // { decimal: 1.9, price_boost_type: 'boost' }
   * Even though we have ladder+5, it's still standard boost because the amount of ladders above the current decimal is only 1
   */
  const priceBoostType = isNegative
    ? PriceBoostTypes.STANDARD
    : ladderIndex <= 3
      ? PriceBoostTypes.BOOST
      : PriceBoostTypes.SUPER_BOOST;

  return {
    decimal: parseFloat(foundActualLadder.in_decimal),
    fractional: foundActualLadder.in_fraction,
    price_boost_type: priceBoostType,
  };
};

/**
 * @description - Enhanced version that fully supports both positive and negative ladder values.
 * Supports ladder+1, ladder+2, ladder-1, ladder-2, etc.
 * - Positive ladders (ladder+X): Select the Xth ladder value greater than the current decimal
 * - Negative ladders (ladder-X): Select the Xth ladder value less than the current decimal
 * Returns an object with decimal, fractional, and price boost type.
 * @example
 * // Positive ladder example:
 * // current ladders - [1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
 * const decimal = 1.7;
 * const ladder = 'ladder+2';
 * getLadderBoostedPriceV4({ sportSlug: 'football', decimal, ladderValue: ladder, laddersMap });
 * // { decimal: 1.9, fractional: '9/10', price_boost_type: 'boost' }
 * @example
 * // Negative ladder example:
 * // current ladders - [1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
 * const decimal = 1.9;
 * const ladder = 'ladder-2';
 * getLadderBoostedPriceV4({ sportSlug: 'football', decimal, ladderValue: ladder, laddersMap });
 * // { decimal: 1.7, fractional: '7/10', price_boost_type: 'standard' }
 */
export const getLadderBoostedPriceV4 = (
  payload: GetLadderBoostedPriceV2Dto,
): { decimal: number; price_boost_type: PriceBoostTypes; fractional: string } => {
  const { sportSlug, decimal: originalDecimalOdd, ladderValue, laddersMap } = payload;

  /**
   * @description - If the decimal is not available or ladder is -1, return 0.
   */
  if (!originalDecimalOdd || ladderValue === '-1') {
    return { decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD };
  }

  const decimal = stripDecimal(originalDecimalOdd);

  // Get the ladders based on the sportSlug.
  // If the ladders are not available, use the master ladders.
  const ladders = laddersMap.get(sportSlug) || laddersMap.get('master');

  /**
   * @description - If the ladders are not available, return 0.
   */
  if (!ladders) {
    return { decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD };
  }

  /**
   * @description - Parse the ladder value to determine if it's positive or negative.
   * @example
   * - If the ladderValue is 'ladder+1', then ladder is 1, isNegative is false.
   * - If the ladderValue is 'ladder+4', then ladder is 4, isNegative is false.
   * - If the ladderValue is 'ladder-1', then ladder is 1, isNegative is true.
   * - If the ladderValue is 'ladder-2', then ladder is 2, isNegative is true.
   */
  const { ladder, isNegative } = parseLadderValue(ladderValue);

  const ladderNumber = +ladder;

  /**
   * @description - Filter ladders based on whether we're looking for higher or lower values.
   * For positive ladders (ladder+X): Find all ladders greater than current decimal.
   * For negative ladders (ladder-X): Find all ladders less than current decimal.
   */
  const foundLadders = ladders.filter((x) => {
    const laddersDecimal = new Decimal(x.in_decimal);

    return isNegative ? laddersDecimal.lessThan(decimal) : laddersDecimal.greaterThan(decimal);
  });

  /**
   * @description - For negative ladders, reverse the array so we can pick from highest to lowest.
   * This ensures ladder-1 gets the closest value below the current decimal.
   */
  if (isNegative) {
    foundLadders.reverse();
  }

  let ladderIndex = ladderNumber;
  let foundActualLadder: LadderModel;

  /**
   * @description - Select the appropriate ladder based on the ladder number.
   * If we don't have enough ladders, use the last available one.
   */
  if (foundLadders?.length > ladderNumber - 1) {
    foundActualLadder = foundLadders[ladderNumber - 1];
  } else {
    foundActualLadder = foundLadders[foundLadders?.length - 1];
    ladderIndex = foundLadders?.length;
  }

  if (!foundActualLadder) {
    return { decimal: 0, fractional: '0/1', price_boost_type: PriceBoostTypes.STANDARD };
  }

  /**
   * @description - Determine the price boost type based on the ladder direction and index.
   * - Negative ladders (ladder-X): Always STANDARD (no boost for lower prices).
   * - Positive ladders (ladder+X):
   *   - Index 1-3: BOOST
   *   - Index 4+: SUPER_BOOST
   * Note: The actual index used may be less than requested if not enough ladders are available.
   * @example
   * // With ladders [1.5, 1.6, 1.7, 1.8, 1.9] and decimal 1.8:
   * // ladder+5 would only have 1 ladder above (1.9), so ladderIndex becomes 1, resulting in BOOST
   */
  const priceBoostType = isNegative
    ? PriceBoostTypes.STANDARD
    : ladderIndex <= 3
      ? PriceBoostTypes.BOOST
      : PriceBoostTypes.SUPER_BOOST;

  return {
    decimal: parseFloat(foundActualLadder.in_decimal),
    fractional: foundActualLadder.in_fraction,
    price_boost_type: priceBoostType,
  };
};
