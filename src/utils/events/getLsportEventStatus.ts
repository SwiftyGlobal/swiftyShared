import type { EventPhaseStatus } from '../../types';
import { EventStatuses, SportEventStatuses } from '../../common';
import type { GetLSportEventStatusDto } from '../../common';

export const getLsportEventStatus = (payload: GetLSportEventStatusDto): EventPhaseStatus => {
  const { eventStatusId } = payload;

  // Unknown/unmapped status ids (e.g. 0) fall back to pre_match, matching getBetRadarEventStatus.
  const currentStatus = EventStatuses.LSPORTS[eventStatusId] ?? SportEventStatuses.PRE_MATCH;

  const currentPhase = currentStatus === SportEventStatuses.PRE_MATCH ? 'Pre Match' : 'In Play';

  return { current_status: currentStatus, current_phase: currentPhase };
};
