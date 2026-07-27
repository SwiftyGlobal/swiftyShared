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
  BET_RADAR: {
    '0': SportEventStatuses.PRE_MATCH, // not_started
    '1': SportEventStatuses.IN_PLAY, // live
    '2': SportEventStatuses.FINISHED, // ended
    '3': SportEventStatuses.SUSPENDED,
    '4': SportEventStatuses.CANCELLED,
    '5': SportEventStatuses.INTERRUPTED,
    '6': SportEventStatuses.POSTPONED,
    '7': SportEventStatuses.DELAYED,
    '8': SportEventStatuses.ABANDONED,
    '9': SportEventStatuses.RESCHEDULED,
  },
} as const;
