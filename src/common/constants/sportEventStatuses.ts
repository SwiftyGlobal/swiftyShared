export enum SportEventStatuses {
  PRE_MATCH = 'pre_match',
  IN_PLAY = 'in_play',
  FINISHED = 'finished',
  ABANDONED = 'abandoned',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  INTERRUPTED = 'interrupted',
  COVERAGE_LOST = 'coverage_lost',
  CLOSED = 'closed',
  // Added for #123 — provider states the canonical enum previously could not represent.
  DELAYED = 'delayed',
  RESCHEDULED = 'rescheduled',
  WALKOVER = 'walkover',
  RETIRED = 'retired',
  VOID = 'void',
}

/**
 * Canonical human-readable label for every event status — the single source of truth for
 * the `current_phase` field returned by the provider status helpers.
 *
 * Typed as `Record<SportEventStatuses, string>` on purpose: adding a status to the enum
 * without giving it a label here is a compile error.
 *
 * These strings are not cosmetic: `current_phase` is persisted (CMS `event_settings` /
 * `custom_events`) and matched on downstream — SwiftyGamingBackend's `formStatusFromPhases`,
 * the CMS upcoming-event filter, and the back-office phase-override dropdown all key off them.
 * PRE_MATCH/IN_PLAY are therefore hyphenated to match that stored vocabulary; the earlier
 * spaced spellings ("Pre Match"/"In Play") were a second name for the same status and matched
 * nothing downstream (#123). Do not re-space them without migrating those consumers.
 */
export const SportEventStatusLabels: Record<SportEventStatuses, string> = {
  [SportEventStatuses.PRE_MATCH]: 'Pre-Match',
  [SportEventStatuses.IN_PLAY]: 'In-Play',
  [SportEventStatuses.FINISHED]: 'Finished',
  [SportEventStatuses.ABANDONED]: 'Abandoned',
  [SportEventStatuses.SUSPENDED]: 'Suspended',
  [SportEventStatuses.CANCELLED]: 'Cancelled',
  [SportEventStatuses.POSTPONED]: 'Postponed',
  [SportEventStatuses.INTERRUPTED]: 'Interrupted',
  [SportEventStatuses.COVERAGE_LOST]: 'Coverage Lost',
  [SportEventStatuses.CLOSED]: 'Closed',
  [SportEventStatuses.DELAYED]: 'Delayed',
  [SportEventStatuses.RESCHEDULED]: 'Rescheduled',
  [SportEventStatuses.WALKOVER]: 'Walkover',
  [SportEventStatuses.RETIRED]: 'Retired',
  [SportEventStatuses.VOID]: 'Void',
};
