import moment from 'moment';

import { EventStatuses, SportEventStatuses } from '../../common';
import type { GetSwiftyFeedRacingEventStatusDto } from '../../common';

const isResulted = (value: GetSwiftyFeedRacingEventStatusDto['resulted']): boolean =>
  value === true || value === 1 || value === '1';

/**
 * Platform status of a Swifty feed racing event, from the feed's status word and the off time.
 * Same shape and precedence as `getRasEventStatus`: a terminal word wins, then suspend-at-off,
 * then the in-play word, then the off time, else pre-match.
 *
 * @example
 * ```typescript
 * getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null }); // 'pre_match'
 * getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: '2026-10-05 14:02:11' }); // 'in_play'
 * getSwiftyFeedRacingEventStatus({ status: 'in_progress', resulted: 1, eventOffTime: null }); // 'finished'
 * getSwiftyFeedRacingEventStatus({ status: 'cancelled', eventOffTime: null }); // 'abandoned'
 * ```
 */
export const getSwiftyFeedRacingEventStatus = (payload: GetSwiftyFeedRacingEventStatusDto): SportEventStatuses => {
  const { status, resulted, eventOffTime, suspendAtEventOffTime, eventStartTime } = payload;
  const mapped = status
    ? EventStatuses.SWIFTY_FEED_RACING[status as keyof typeof EventStatuses.SWIFTY_FEED_RACING]
    : undefined;

  if (mapped === SportEventStatuses.ABANDONED) {
    return SportEventStatuses.ABANDONED;
  }

  if (mapped === SportEventStatuses.FINISHED || isResulted(resulted)) {
    return SportEventStatuses.FINISHED;
  }

  if (suspendAtEventOffTime && eventStartTime) {
    const now = moment();
    const startDate = moment(eventStartTime).utc(true);

    if (now.isAfter(startDate)) {
      return SportEventStatuses.IN_PLAY;
    }
  }

  if (mapped === SportEventStatuses.IN_PLAY) {
    return SportEventStatuses.IN_PLAY;
  }

  if (eventOffTime) {
    return SportEventStatuses.IN_PLAY;
  }

  return SportEventStatuses.PRE_MATCH;
};
