import moment from 'moment';

import { SportEventStatuses } from '../../common';
import type { GetSisEventStatusDto } from '../../common';

/**
 * Determines the status of a sports event based on the provided parameters.
 *
 * @param {GetSisEventStatusDto} payload
 * @param {Nullable<string>} payload.offTime - The off time of the event, or null if not available. (From SIS, this is a string representing the time without date, e.g., '05:01:11')
 * @param {boolean} payload.isEventResulted - Indicates whether the event has been resulted.
 * @param {boolean} [payload.suspendAtEventOffTime] - Optional flag indicating whether to suspend at event off time.
 * @returns {SportEventStatuses} - The status of the sports event.
 */
export const getSISEventStatus = (payload: GetSisEventStatusDto): SportEventStatuses => {
  const { isEventResulted, offTime, suspendAtEventOffTime, eventStartTime } = payload;

  if (isEventResulted) {
    return SportEventStatuses.FINISHED;
  }

  if (suspendAtEventOffTime && eventStartTime) {
    const now = moment();

    const startDate = moment(eventStartTime).utc(true);

    if (now.isAfter(startDate)) {
      return SportEventStatuses.IN_PLAY;
    }
  }

  if (offTime) {
    return SportEventStatuses.IN_PLAY;
  }

  return SportEventStatuses.PRE_MATCH;
};
