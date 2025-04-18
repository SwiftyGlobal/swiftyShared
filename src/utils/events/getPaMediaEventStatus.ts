import type { Nullable } from '../../types';
import { SportEventStatuses } from '../../common';

const inPlayStatuses: Set<Nullable<string>> = new Set(['Active', 'Off']);
const abandonedStatuses: Set<Nullable<string>> = new Set(['Abandoned']);
const preMatchStatuses: Set<Nullable<string>> = new Set(['Dormant', null]);
const finishedStatuses: Set<Nullable<string>> = new Set([
  'Result',
  'Race Void',
  'RaceVoid',
  'Final Result',
  'Final',
  'Result',
  'Finished',
  'WeighedIn',
]);

export const getPaMediaEventStatus = (
  raceStatus: Nullable<string>,
  eventOffTime: Nullable<string>,
): SportEventStatuses => {
  if (eventOffTime && !finishedStatuses.has(raceStatus) && !abandonedStatuses.has(raceStatus)) {
    return SportEventStatuses.IN_PLAY;
  }

  if (inPlayStatuses.has(raceStatus)) {
    return SportEventStatuses.IN_PLAY;
  }

  if (abandonedStatuses.has(raceStatus)) {
    return SportEventStatuses.ABANDONED;
  }

  if (finishedStatuses.has(raceStatus)) {
    return SportEventStatuses.FINISHED;
  }

  if (preMatchStatuses.has(raceStatus)) {
    return SportEventStatuses.PRE_MATCH;
  }

  return SportEventStatuses.PRE_MATCH;
};
