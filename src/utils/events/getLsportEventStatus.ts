import type { EventPhaseStatus } from '../../types';
import { EventStatuses, SportEventStatuses, SportEventStatusLabels } from '../../common';
import type { GetLSportEventStatusDto } from '../../common';

export const getLsportEventStatus = (payload: GetLSportEventStatusDto): EventPhaseStatus => {
  const { eventStatusId } = payload;

  // Unknown/unmapped status ids (e.g. 0) fall back to pre_match, matching getBetRadarEventStatus.
  const currentStatus = EventStatuses.LSPORTS[eventStatusId] ?? SportEventStatuses.PRE_MATCH;

  // Label comes from SportEventStatusLabels so there is exactly one spelling per status (#123).
  const currentPhase = SportEventStatusLabels[currentStatus];

  return { current_status: currentStatus, current_phase: currentPhase };
};
