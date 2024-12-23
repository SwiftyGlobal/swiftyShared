import type { LadderValues } from '@internal-types/ladderValues';
import type { LaddersMap } from '@internal-types/laddersMap';
import type { Nullable } from '@internal-types/nullable';

export interface GetLadderBoostedPriceV2Dto {
  /**
   * @description - The ladder value to be used for the calculation of the boosted price. E.g. ladder+1, ladder+2, ladder+3, ladder+4 or -1.
   */
  ladderValue: LadderValues;
  decimal: Nullable<number>;
  sportSlug: string;
  /**
   * @description - The map of ladders based on the sport slug. Key is the sport slug and value is the list of representing ladders.
   */
  laddersMap: LaddersMap;
}
