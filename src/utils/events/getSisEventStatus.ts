import { SportEventStatuses } from '../../common';
import type { Nullable } from '../../types';

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
