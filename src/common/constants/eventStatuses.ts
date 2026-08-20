import { SportEventStatuses } from './sportEventStatuses';

export const LSportEventStatuses = {
  Pending: '1',
  InProgress: '2',
  Ended: '3',
  Canceled: '4',
  Postponed: '5',
  Interrupted: '6',
  Abandoned: '7',
  CoverageLost: '8',
  AboutToStart: '9',
} as const;

export const EventStatuses = {
  LSPORTS: {
    '1': SportEventStatuses.PRE_MATCH,
    '2': SportEventStatuses.IN_PLAY,
    '3': SportEventStatuses.FINISHED,
    '4': SportEventStatuses.CANCELLED,
    '5': SportEventStatuses.POSTPONED,
    '6': SportEventStatuses.INTERRUPTED,
    '7': SportEventStatuses.ABANDONED,
    '8': SportEventStatuses.COVERAGE_LOST,
    '9': SportEventStatuses.PRE_MATCH, // Assuming "About to start" is equivalent to PRE_MATCH
  },
  EVERYMATRIX: {
    '1': SportEventStatuses.PRE_MATCH,
    '2': SportEventStatuses.IN_PLAY,
    '3': SportEventStatuses.FINISHED,
    '4': SportEventStatuses.INTERRUPTED,
    '5': SportEventStatuses.CANCELLED,
    '6': SportEventStatuses.WALKOVER,
    '7': SportEventStatuses.ABANDONED,
    '8': SportEventStatuses.RETIRED,
  },
  /**
   * Betradar event-level lifecycle codes, on the UOF numbering.
   *
   * These meanings were shifted by unified-consumer-app's
   * scripts/migrate-event-status-to-uof.js, which reconciled two writers that disagreed: the
   * AMQP path always wrote UOF codes, while the REST fixture paths used a table that swapped
   * 2/3 and collapsed closed onto 2. That script remaps 2->3, 3->2, 4->5, 5->6, 6->7, 7->8,
   * 8->9, 9->10 and has been executed on prod (status 2 went from 76,361 rows to 800, status 3
   * from 4,441 to 78,006 over 2026-08-20).
   *
   * This table previously encoded the PRE-migration meanings, so post-migration it read every
   * terminal code one place out — most consequentially reporting the 78,006 ended events as
   * SUSPENDED. That was unreachable at the time, because every Betradar reader filters to
   * `status IN (0,1)` before calling into here (betRadar.service.ts, betSlip.utils.ts,
   * cashOut.service.ts, and the worker's BR crons), so no punter ever saw it. It stops being
   * unreachable as soon as anything broadcasts the non-live statuses, which is why it is
   * corrected here.
   *
   * Keep this aligned with that migration script's REMAP table; they are two halves of one
   * contract.
   */
  BET_RADAR: {
    '0': SportEventStatuses.PRE_MATCH, // not_started
    '1': SportEventStatuses.IN_PLAY, // live
    '2': SportEventStatuses.SUSPENDED,
    '3': SportEventStatuses.FINISHED, // ended
    '4': SportEventStatuses.CLOSED,
    '5': SportEventStatuses.CANCELLED,
    '6': SportEventStatuses.INTERRUPTED,
    '7': SportEventStatuses.POSTPONED,
    '8': SportEventStatuses.DELAYED,
    '9': SportEventStatuses.ABANDONED,
    '10': SportEventStatuses.RESCHEDULED,
  },
  SWIFTY_FEED: {
    '1': SportEventStatuses.PRE_MATCH, // scheduled
    '2': SportEventStatuses.IN_PLAY, // in_progress
    '3': SportEventStatuses.FINISHED, // completed
  },
} as const;
