import type { EventPhaseStatus } from '../../types';
import type { GetBetRadarEventStatusDto } from '../../common';
import { EventStatuses, SportEventStatuses, SportEventStatusLabels } from '../../common';

/**
 * @description Maps a BetRadar numeric event status id to the canonical SportEventStatus and its label.
 * @param payload {GetBetRadarEventStatusDto} - The payload containing the event status id.
 * @param payload.eventStatusId {string} - The BetRadar status id (see EventStatuses.BET_RADAR).
 * @return {EventPhaseStatus} - The canonical status slug plus the human-readable phase label.
 * @example
 * getBetRadarEventStatus({ eventStatusId: '1' }); // { current_status: 'in_play',   current_phase: 'In Play' }
 * getBetRadarEventStatus({ eventStatusId: '4' }); // { current_status: 'cancelled', current_phase: 'Cancelled' }
 * getBetRadarEventStatus({ eventStatusId: '99' }); // unknown -> { current_status: 'pre_match', current_phase: 'Pre Match' }
 */
export const getBetRadarEventStatus = (payload: GetBetRadarEventStatusDto): EventPhaseStatus => {
  const { eventStatusId } = payload;

  const current_status = EventStatuses.BET_RADAR[eventStatusId] ?? SportEventStatuses.PRE_MATCH;

  return { current_status, current_phase: SportEventStatusLabels[current_status] };
};
