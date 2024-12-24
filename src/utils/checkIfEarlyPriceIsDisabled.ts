import moment from 'moment';

import type { MysqlBoolean, Nullable, RacingSportProviders } from '../types';
import { convertMysqlBoolean } from './convertMysqlBoolean';

/**
 * @returns - true if the early price is disabled, otherwise false
 */
export const checkIfEarlyPriceIsDisabled = (
  racingCompetitions: Map<string, { early_price_show: MysqlBoolean; early_price_start_time: Nullable<string> }>,
  venueName: string,
  provider: RacingSportProviders,
): boolean => {
  /**
   * @description - If selection current price is Early (E), the odds should be SP if current time is before the competition early price start time (see https://cms-test.swiftygroup.com/sport/horseracing)
   */
  const now = moment(new Date(), 'hh:mm').utc();

  const venueProviderKey = `${provider}-${venueName}`;

  const competitionMaybe = racingCompetitions.get(venueProviderKey);

  if (competitionMaybe) {
    const { early_price_show, early_price_start_time } = competitionMaybe;

    const earlyPriceStartTime = moment(early_price_start_time, 'hh:mm').utc(true);

    const isEarlyPriceOff = !convertMysqlBoolean(early_price_show);

    const isEarlyPriceBefore = now.isBefore(earlyPriceStartTime);

    /**
     * @description - If early price show is disabled or current time is before the early price start time, the odds should be SP for that venue (competition)
     */
    if (isEarlyPriceOff || isEarlyPriceBefore) {
      return true;
    }
  }

  return false;
};
