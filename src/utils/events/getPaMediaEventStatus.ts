import type { Nullable } from '../../types';
import { SportEventStatuses } from '../../common';

/**
 * Determines the status of a PA media event based on the race status and event off time.
 *
 * @param {Nullable<string>} raceStatus - The current status of the race. Can be null or a string.
 * @param {Nullable<string>} eventOffTime - The scheduled off time of the event. Can be null or a string.
 * @returns {SportEventStatuses} - The determined status of the event, which can be one of the predefined `SportEventStatuses`.
 */

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
