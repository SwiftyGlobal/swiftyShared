import type { EventPhaseStatus } from '../../types';
import { SportEventStatuses } from '../../common';

export const getManualEventPhaseStatus = (eventPhase: string): EventPhaseStatus => {
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
