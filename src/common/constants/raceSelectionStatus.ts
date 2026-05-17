import { BetResultType } from './betResultType';

export enum RaceSelectionStatus {
  RUNNER = 'Runner',
  NON_RUNNER = 'NonRunner',
  PULLED_UP = 'PulledUp',
  WINNER = 'Winner',
  PLACED = 'Placed',
  LOSER = 'Loser',
  NON_AVAILABLE = 'NonAvailable',
}

export const raceSelectionMap = (race_status: RaceSelectionStatus | string): BetResultType => {
  switch (race_status) {
    case RaceSelectionStatus.NON_RUNNER:
    case RaceSelectionStatus.PULLED_UP:
      return BetResultType.VOID;
    case RaceSelectionStatus.WINNER:
      return BetResultType.WINNER;
    case RaceSelectionStatus.PLACED:
      return BetResultType.PLACED;
    case RaceSelectionStatus.LOSER:
      return BetResultType.LOSER;
    case RaceSelectionStatus.NON_AVAILABLE:
    default:
      return BetResultType.OPEN;
  }
};
