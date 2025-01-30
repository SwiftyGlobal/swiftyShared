import type { LadderValues } from '../types';

/**
 * @description - Parse the ladder value to get the number and if it is negative or not.
 * @example
 * - If the ladderValue is 'ladder+1', then the ladder is 1 and isNegative is false.
 * - If the ladderValue is 'ladder+4', then the ladder is 4 and isNegative is false.
 * - If the ladderValue is 'ladder-8', then the ladder is 8 and isNegative is true.
 */
export const parseLadderValue = (ladderValue: Exclude<LadderValues, '-1'>): { ladder: number; isNegative: boolean } => {
  const numStr = ladderValue.replace('ladder', '');
  const isNegative = numStr.startsWith('-');

  return { ladder: +numStr.slice(1), isNegative };
};
