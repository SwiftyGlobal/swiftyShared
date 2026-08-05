import type { GetEveryMatrixEventStatusDto } from '../../common';
import { EventStatuses, EveryMatrixPhase, SportEventStatuses, SportEventStatusLabels } from '../../common';
import type { EventPhaseStatus } from '../../types';

/**
 * Determines the current phase and status of an EveryMatrix event.
 *
 * The canonical status is resolved from `EventStatuses.EVERYMATRIX`; an unrecognised status id
 * falls back to IN_PLAY (preserving the previous "anything that is not pre-match/finished is in
 * play" behaviour). For in-play events the granular live phase comes from
 * `EveryMatrixPhase[eventPartId]`; every other status uses its canonical label.
 *
 * @param {GetEveryMatrixEventStatusDto} payload - The data transfer object containing event details.
 * @param {string} payload.eventStatusId - The provider status id.
 * @param {number} payload.eventPartId - The provider part/phase id (drives the live-phase label).
 * @param {string} payload.eventStartTime - Accepted for DTO compatibility; not used (status comes from the map).
 * @param {string} payload.now - Accepted for DTO compatibility; not used.
 * @returns {EventPhaseStatus} An object containing the current phase and status of the event.
 */
export const getEveryMatrixEventStatus = (payload: GetEveryMatrixEventStatusDto): EventPhaseStatus => {
  const { eventStatusId, eventPartId } = payload;

  const current_status: SportEventStatuses = EventStatuses.EVERYMATRIX[eventStatusId] ?? SportEventStatuses.IN_PLAY;

  let current_phase: string;

  if (current_status === SportEventStatuses.IN_PLAY) {
    // Granular live phase from the part id, else the canonical "In-Play" label.
    current_phase = EveryMatrixPhase[eventPartId] || SportEventStatusLabels[SportEventStatuses.IN_PLAY];
  } else {
    current_phase = SportEventStatusLabels[current_status];
  }

  return {
    current_phase,
    current_status,
  };
};
