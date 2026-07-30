export interface GetSwiftyFeedEventStatusDto {
  /**
   * The feed's `events.event_status_id` (see EventStatuses.SWIFTY_FEED).
   * Accepts a number as well as a string: the column is a MySQL INT, so mysql2
   * hands it back as a number, while callers reading it off a typed row may pass a string.
   */
  eventStatusId: string | number;
}
