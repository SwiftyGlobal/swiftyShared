import type { Nullable, SportEventStatuses } from '../../types';

export const getSISEventStatus = (offTime: Nullable<string>, isEventResulted: boolean): SportEventStatuses => {
  if (isEventResulted) {
    return 'finished';
  }

  if (offTime) {
    return 'in_play';
  }

  if (!offTime) {
    return isEventResulted ? 'finished' : 'pre_match';
  }

  return 'pre_match';
};
