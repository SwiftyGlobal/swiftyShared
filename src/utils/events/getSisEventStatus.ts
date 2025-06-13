import { SportEventStatuses } from '../../common';
import type { GetSisEventStatusDto } from '../../common';

/**
 * Determines the status of a sports event based on the provided parameters.
 *
 * @param {GetSisEventStatusDto} payload
 * @param {Nullable<string>} payload.offTime - The off time of the event, or null if not available.
 * @param {boolean} payload.isEventResulted - Indicates whether the event has been resulted.
 * @returns {SportEventStatuses} - The status of the sports event.
 */
export const getSISEventStatus = (payload: GetSisEventStatusDto): SportEventStatuses => {
  const { isEventResulted, offTime } = payload;

  if (isEventResulted) {
    return SportEventStatuses.FINISHED;
  }

  if (offTime) {
    return SportEventStatuses.IN_PLAY;
  }

  return SportEventStatuses.PRE_MATCH;
};
