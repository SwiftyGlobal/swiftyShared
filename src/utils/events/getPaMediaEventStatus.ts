import type { Nullable, SportEventStatuses } from '../../types';

const inPlayStatuses: Set<Nullable<string>> = new Set(['Active', 'Off']);
const abandonedStatuses: Set<Nullable<string>> = new Set(['Abandoned']);
const preMatchStatuses: Set<Nullable<string>> = new Set(['Dormant', null]);
const finishedStatuses: Set<Nullable<string>> = new Set([
  'Result',
  'Race Void',
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
    return 'in_play';
  }

  if (inPlayStatuses.has(raceStatus)) {
    return 'in_play';
  }

  if (abandonedStatuses.has(raceStatus)) {
    return 'abandoned';
  }

  if (finishedStatuses.has(raceStatus)) {
    return 'finished';
  }

  if (preMatchStatuses.has(raceStatus)) {
    return 'pre_match';
  }

  return 'pre_match';
};
