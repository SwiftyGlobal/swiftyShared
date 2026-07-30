import type { EventPhaseStatus } from '../../types';
import type { GetSwiftyFeedEventStatusDto } from '../../common';
import { EventStatuses, SportEventStatuses, SportEventStatusLabels } from '../../common';

/**
 * @description Maps a swifty-feed event status id to the canonical SportEventStatus and its label.
 * The id is normalised to a string first: the feed column is a MySQL INT, so it arrives as a
 * number at runtime even where a row type declares it as a string.
 * @param payload {GetSwiftyFeedEventStatusDto} - The payload containing the event status id.
 * @param payload.eventStatusId {string | number} - The feed status id (see EventStatuses.SWIFTY_FEED).
 * @return {EventPhaseStatus} - The canonical status slug plus the human-readable phase label.
 * @example
 * getSwiftyFeedEventStatus({ eventStatusId: 2 });   // { current_status: 'in_play',  current_phase: 'In Play' }
 * getSwiftyFeedEventStatus({ eventStatusId: '3' }); // { current_status: 'finished', current_phase: 'Finished' }
 * getSwiftyFeedEventStatus({ eventStatusId: 99 });  // unknown -> { current_status: 'pre_match', current_phase: 'Pre Match' }
 */
export const getSwiftyFeedEventStatus = (payload: GetSwiftyFeedEventStatusDto): EventPhaseStatus => {
  const { eventStatusId } = payload;

  const current_status = EventStatuses.SWIFTY_FEED[String(eventStatusId)] ?? SportEventStatuses.PRE_MATCH;

  return { current_status, current_phase: SportEventStatusLabels[current_status] };
};
