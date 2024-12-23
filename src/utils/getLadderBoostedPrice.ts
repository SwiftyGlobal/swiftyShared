import type { LadderValues } from '@internal-types/ladderValues';
import { oddsKeys } from '@common/constants';
import type { GetLadderBoostedPriceV2Dto } from '@common/dto';

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
