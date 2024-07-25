import type { Nullable } from '../../types';
import { SportEventStatuses } from '../../common';

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
