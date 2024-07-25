import type { EventPhaseStatus, SportEventStatuses } from '../../types';

export const getManualEventPhaseStatus = (eventPhase: string): EventPhaseStatus => {
  let current_status: SportEventStatuses = 'pre_match';
  const current_phase = eventPhase;

  if (eventPhase === 'InPlay') {
    current_status = 'in_play';
  } else if (eventPhase === 'PreMatch' || eventPhase === 'Pre-Match') {
    current_status = 'pre_match';
  }

  return {
    current_status,
    current_phase,
  };
};
