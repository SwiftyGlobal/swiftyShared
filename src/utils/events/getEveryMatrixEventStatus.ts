import type { GetEveryMatrixEventStatusDto } from '../../common';
import { EveryMatrixPhase, SportEventStatuses } from '../../common';
import type { EventPhaseStatus } from '../../types';

/**
 * Determines the current phase and status of an event based on the provided payload.
 *
 * @param {GetEveryMatrixEventStatusDto} payload - The data transfer object containing event details.
 * @param {string} payload.eventStatusId - The ID representing the event's status.
 * @param {string} payload.eventPartId - The ID representing the event's part/phase.
 * @param {Date} payload.eventStartTime - The start time of the event.
 * @param {Date} payload.now - The current time.
 * @returns {EventPhaseStatus} An object containing the current phase and status of the event.
 */
export const getEveryMatrixEventStatus = (payload: GetEveryMatrixEventStatusDto): EventPhaseStatus => {
  const { eventStatusId, eventPartId, eventStartTime, now } = payload;

  let current_phase: string = eventStatusId === '1' ? 'Pre Match' : EveryMatrixPhase[eventPartId];

  let current_status: SportEventStatuses =
    eventStatusId === '1' ? SportEventStatuses.PRE_MATCH : SportEventStatuses.IN_PLAY;

  if (!current_phase && current_status == 'in_play') {
    current_phase = 'In Play';
  }

  if (!current_phase && eventStartTime < now) {
    current_phase = 'In Play';
    current_status = SportEventStatuses.IN_PLAY;
  }

  if (eventStatusId === '3') {
    current_phase = 'Finished';
    current_status = SportEventStatuses.FINISHED;
  }

  return {
    current_phase,
    current_status,
  };
};
