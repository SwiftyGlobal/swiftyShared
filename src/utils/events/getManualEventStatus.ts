import { SportEventStatuses } from '../../common';
import type { EventPhaseStatus } from '../../types';
import type { GetManualEventStatusDto } from '../../common';

/**
 * Determines the manual event phase status based on the provided payload.
 *
 * @param {GetManualEventStatusDto} payload - The payload containing the event phase.
 * @param {string} payload.eventPhase - The current phase of the event (e.g., 'InPlay', 'PreMatch', 'Pre-Match').
 * @returns {EventPhaseStatus} An object containing the current status and phase of the event.
 */
export const getManualEventPhaseStatus = (payload: GetManualEventStatusDto): EventPhaseStatus => {
  const { eventPhase } = payload;

  let current_status: SportEventStatuses = SportEventStatuses.PRE_MATCH;
  const current_phase = eventPhase;

  if (eventPhase === 'InPlay') {
    current_status = SportEventStatuses.IN_PLAY;
  } else if (eventPhase === 'PreMatch' || eventPhase === 'Pre-Match') {
    current_status = SportEventStatuses.PRE_MATCH;
  }

  return {
    current_status,
    current_phase,
  };
};
