export interface GetBetRadarEventStatusDto {
  eventStatusId: string;
  /**
   * Betradar's period-level phase code (`sport_event_status.match_status`), e.g. 9 = 2nd Set for
   * tennis. Optional: when absent, or when the code is not one we can name for the sport, the
   * phase falls back to the event-level status label.
   */
  matchStatus?: string | number | null;
  /**
   * Required alongside `matchStatus` — the same code means different things per sport (6 is a
   * soccer half, 13 a basketball quarter), so the phase cannot be resolved without it.
   */
  sportSlug?: string | null;
}
