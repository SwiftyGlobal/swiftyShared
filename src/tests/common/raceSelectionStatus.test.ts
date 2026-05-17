import { BetResultType } from '../../common/constants/betResultType';
import { RaceSelectionStatus, raceSelectionMap } from '../../common/constants/raceSelectionStatus';

describe('RaceSelectionStatus', () => {
  it('exposes the canonical race-state strings', () => {
    expect(RaceSelectionStatus.RUNNER).toBe('Runner');
    expect(RaceSelectionStatus.NON_RUNNER).toBe('NonRunner');
    expect(RaceSelectionStatus.PULLED_UP).toBe('PulledUp');
    expect(RaceSelectionStatus.WINNER).toBe('Winner');
    expect(RaceSelectionStatus.PLACED).toBe('Placed');
    expect(RaceSelectionStatus.LOSER).toBe('Loser');
    expect(RaceSelectionStatus.NON_AVAILABLE).toBe('NonAvailable');
  });
});

describe('raceSelectionMap', () => {
  it('maps WINNER → BetResultType.WINNER', () => {
    expect(raceSelectionMap(RaceSelectionStatus.WINNER)).toBe(BetResultType.WINNER);
  });

  it('maps PLACED → BetResultType.PLACED', () => {
    expect(raceSelectionMap(RaceSelectionStatus.PLACED)).toBe(BetResultType.PLACED);
  });

  it('maps LOSER → BetResultType.LOSER', () => {
    expect(raceSelectionMap(RaceSelectionStatus.LOSER)).toBe(BetResultType.LOSER);
  });

  it('maps NON_RUNNER and PULLED_UP → VOID', () => {
    expect(raceSelectionMap(RaceSelectionStatus.NON_RUNNER)).toBe(BetResultType.VOID);
    expect(raceSelectionMap(RaceSelectionStatus.PULLED_UP)).toBe(BetResultType.VOID);
  });

  it('maps NON_AVAILABLE and unknown → OPEN', () => {
    expect(raceSelectionMap(RaceSelectionStatus.NON_AVAILABLE)).toBe(BetResultType.OPEN);
    expect(raceSelectionMap('something-else')).toBe(BetResultType.OPEN);
  });
});
