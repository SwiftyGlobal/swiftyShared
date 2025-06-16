import type { EventPhaseStatus } from '../../types';
import type { GetBetRadarEventStatusDto } from '../../common';
import { EventStatuses, SportEventStatuses } from '../../common';

/**
 * @description Determines the status of a BetRadar sports event based on the provided parameters.
 * @param payload {GetBetRadarEventStatusDto} payload - The payload containing the event status ID.
 * @param payload.eventStatusId {number} eventStatusId - The ID of the event status.
 * @return {EventPhaseStatus} - The status of the BetRadar sports event, including the current status and phase.
 * @example
 * getBetRadarEventStatus({ eventStatusId: 1 }); // { current_status: 'PRE_MATCH', current_phase: 'Pre Match' }
 * getBetRadarEventStatus({ eventStatusId: 2 }); // { current_status: 'IN_PLAY', current_phase: 'In Play' }
 * getBetRadarEventStatus({ eventStatusId: 3 }); // { current_status: 'FINISHED', current_phase: 'Finished' }
 * getBetRadarEventStatus({ eventStatusId: 4 }); // { current_status: 'CLOSED', current_phase: 'Closed' }
 * getBetRadarEventStatus({ eventStatusId: 5 }); // { current_status: 'Unknown', current_phase: 'Unknown' }
 */
export const getBetRadarEventStatus = (payload: GetBetRadarEventStatusDto): EventPhaseStatus => {
  const { eventStatusId } = payload;

  const currentStatus = EventStatuses.BET_RADAR[eventStatusId];

  let currentPhase: string;

  switch (currentStatus) {
    case SportEventStatuses.PRE_MATCH:
      currentPhase = 'Pre Match';
      break;
    case SportEventStatuses.IN_PLAY:
      currentPhase = 'In Play';
      break;
    case SportEventStatuses.FINISHED:
      currentPhase = 'Finished';
      break;
    case SportEventStatuses.CLOSED:
      currentPhase = 'Closed';
      break;
    default:
      currentPhase = 'Pre Match'; // Default phase for unrecognized statuses
      break;
  }

  return { current_status: currentStatus || SportEventStatuses.PRE_MATCH, current_phase: currentPhase };
};
