import type { Nullable } from '../../../types';

/**
 * Input for `getSwiftyFeedRacingEventStatus`. Mirrors the RAS DTO: the feed's own status word plus
 * the off time, with the feed's `resulted` flag as a finished short-circuit.
 */
export interface GetSwiftyFeedRacingEventStatusDto {
  /** `racing_events.status`: `scheduled` | `in_progress` | `completed` | `cancelled`, or null. */
  status: Nullable<string>;
  /** `racing_events.resulted`; a tinyint, so `1`, `'1'` or `true` all mean resulted. */
  resulted?: Nullable<boolean | number | string>;
  /** `racing_events.off_time`; any value means the race has gone off. */
  eventOffTime: Nullable<string>;
  suspendAtEventOffTime?: boolean;
  eventStartTime?: Nullable<string>;
}
