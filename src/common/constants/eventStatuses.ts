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
    '6': SportEventStatuses.CANCELLED,
    '7': SportEventStatuses.ABANDONED,
    '8': SportEventStatuses.CANCELLED,
  },
} as const;
