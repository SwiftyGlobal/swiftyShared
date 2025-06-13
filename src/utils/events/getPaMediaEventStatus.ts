import type { Nullable } from '../../types';
import { SportEventStatuses } from '../../common';
import type { GetPaMediaEventStatusDto } from '../../common';

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

/**
 * Determines the status of a PA media event based on the race status and event off time.
 * @param {GetPaMediaEventStatusDto} payload - The payload
 * @param {Nullable<string>} payload.raceStatus - The current status
 * @param {Nullable<string>} payload.eventOffTime - The scheduled off time of the event. Can be null or a string.
 * @returns {SportEventStatuses} - The determined status of the event, which can be one of the predefined `SportEventStatuses`.
 */
export const getPaMediaEventStatus = (payload: GetPaMediaEventStatusDto): SportEventStatuses => {
  const { raceStatus, eventOffTime } = payload;

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
