import type { EventPhaseStatus } from '../../types';
import { EventStatuses, SportEventStatuses } from '../../common';

export const getLsportEventStatus = (eventStatusId: string): EventPhaseStatus => {
  const currentStatus = EventStatuses.LSPORTS[eventStatusId];

  const currentPhase = currentStatus === SportEventStatuses.PRE_MATCH ? 'pre_match' : 'in_play';

  return { current_status: EventStatuses.LSPORTS[eventStatusId], current_phase: currentPhase };
};
