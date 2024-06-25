import { Ladder } from '../types';
import { oddsKeys } from '../common';

/**
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
export const getLadderBoostedPrice = (ladder: Ladder, decimal: number): number => {
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
