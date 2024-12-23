import { SportEventStatuses } from '@constants/sportEventStatuses';
import type { EventPhaseStatus } from '@internal-types/eventPhaseStatus';

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
