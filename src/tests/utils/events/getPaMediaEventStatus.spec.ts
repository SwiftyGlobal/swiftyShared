import { getPaMediaEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getPaMediaEventStatus', () => {
  it('should return IN_PLAY when eventOffTime is defined and raceStatus is not finished or abandoned', () => {
    expect(getPaMediaEventStatus({ raceStatus: 'Active', eventOffTime: '2025-06-10T12:00:00Z' })).toBe(
      SportEventStatuses.IN_PLAY,
    );
  });

  it('should return IN_PLAY when raceStatus is in inPlayStatuses', () => {
    expect(getPaMediaEventStatus({ raceStatus: 'Active', eventOffTime: null })).toBe(SportEventStatuses.IN_PLAY);
    expect(getPaMediaEventStatus({ raceStatus: 'Off', eventOffTime: null })).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return ABANDONED when raceStatus is in abandonedStatuses', () => {
    expect(getPaMediaEventStatus({ raceStatus: 'Abandoned', eventOffTime: null })).toBe(SportEventStatuses.ABANDONED);
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
      expect(getPaMediaEventStatus({ raceStatus: status, eventOffTime: null })).toBe(SportEventStatuses.FINISHED);
    });
  });

  it('should return PRE_MATCH when raceStatus is in preMatchStatuses', () => {
    expect(getPaMediaEventStatus({ raceStatus: 'Dormant', eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
    expect(getPaMediaEventStatus({ raceStatus: null, eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('should return PRE_MATCH by default when no other conditions match', () => {
    expect(getPaMediaEventStatus({ raceStatus: 'UnknownStatus', eventOffTime: null })).toBe(
      SportEventStatuses.PRE_MATCH,
    );
  });

  it('should return SUSPENDED when eventOffTime has passed and suspendAtEventOffTime is true', () => {
    const pastDate = '2020-06-24 10:00:00';

    expect(getPaMediaEventStatus({ raceStatus: 'Active', eventOffTime: pastDate, suspendAtEventOffTime: true })).toBe(
      SportEventStatuses.SUSPENDED,
    );
  });

  it('should return IN_PLAY when eventOffTime has passed and suspendAtEventOffTime is false', () => {
    const pastDate = '2020-06-24 10:00:00';

    expect(getPaMediaEventStatus({ raceStatus: 'Active', eventOffTime: pastDate, suspendAtEventOffTime: false })).toBe(
      SportEventStatuses.IN_PLAY,
    );
  });
});
