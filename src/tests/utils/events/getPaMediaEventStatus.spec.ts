import { getPaMediaEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getPaMediaEventStatus', () => {
  it('should return IN_PLAY when eventOffTime is defined and raceStatus is not finished or abandoned', () => {
    expect(getPaMediaEventStatus('Active', '2025-06-10T12:00:00Z')).toBe(SportEventStatuses.IN_PLAY);
    expect(getPaMediaEventStatus('SomeOtherStatus', '2025-06-10T12:00:00Z')).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return IN_PLAY when raceStatus is in inPlayStatuses', () => {
    expect(getPaMediaEventStatus('Active', null)).toBe(SportEventStatuses.IN_PLAY);
    expect(getPaMediaEventStatus('Off', null)).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return ABANDONED when raceStatus is in abandonedStatuses', () => {
    expect(getPaMediaEventStatus('Abandoned', null)).toBe(SportEventStatuses.ABANDONED);
  });

  it('should return FINISHED when raceStatus is in finishedStatuses', () => {
    const finishedStatuses = [
      'Result',
      'Race Void',
      'RaceVoid',
      'Final Result',
      'Final',
      'Result',
      'Finished',
      'WeighedIn',
    ];
    finishedStatuses.forEach((status) => {
      expect(getPaMediaEventStatus(status, null)).toBe(SportEventStatuses.FINISHED);
    });
  });

  it('should return PRE_MATCH when raceStatus is in preMatchStatuses', () => {
    expect(getPaMediaEventStatus('Dormant', null)).toBe(SportEventStatuses.PRE_MATCH);
    expect(getPaMediaEventStatus(null, null)).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('should return PRE_MATCH by default when no other conditions match', () => {
    expect(getPaMediaEventStatus('UnknownStatus', null)).toBe(SportEventStatuses.PRE_MATCH);
  });
});
