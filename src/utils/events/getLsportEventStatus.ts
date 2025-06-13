import type { EventPhaseStatus } from '../../types';
import { EventStatuses, SportEventStatuses } from '../../common';
import type { GetLSportEventStatusDto } from '../../common';

export const getLsportEventStatus = (payload: GetLSportEventStatusDto): EventPhaseStatus => {
  const { eventStatusId } = payload;

  const currentStatus = EventStatuses.LSPORTS[eventStatusId];

  const currentPhase = currentStatus
    ? currentStatus === SportEventStatuses.PRE_MATCH
      ? 'pre_match'
      : 'in_play'
    : 'pre_match';

  return { current_status: EventStatuses.LSPORTS[eventStatusId], current_phase: currentPhase };
};
