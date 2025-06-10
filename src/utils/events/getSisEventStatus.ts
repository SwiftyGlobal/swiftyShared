import { SportEventStatuses } from '../../common';
import type { Nullable } from '../../types';

/**
 * Determines the status of a sports event based on the provided parameters.
 *
 * @param {Nullable<string>} offTime - The off time of the event, or null if not available.
 * @param {boolean} isEventResulted - Indicates whether the event has been resulted.
 * @returns {SportEventStatuses} - The status of the sports event.
 */

export const getSISEventStatus = (offTime: Nullable<string>, isEventResulted: boolean): SportEventStatuses => {
  if (isEventResulted) {
    return SportEventStatuses.FINISHED;
  }

  if (offTime) {
    return SportEventStatuses.IN_PLAY;
  }

  if (!offTime) {
    return isEventResulted ? SportEventStatuses.FINISHED : SportEventStatuses.PRE_MATCH;
  }

  return SportEventStatuses.PRE_MATCH;
};
