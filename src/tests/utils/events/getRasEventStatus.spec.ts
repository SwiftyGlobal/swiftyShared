import { getRasEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getRasEventStatus', () => {
  it('should return ABANDONED when rasStatus is ABANDONED', () => {
    expect(getRasEventStatus({ rasStatus: 'ABANDONED', eventOffTime: null })).toBe(SportEventStatuses.ABANDONED);
  });

  it('should return FINISHED when rasStatus is in finishedStatuses', () => {
    const finishedStatuses = ['RESULT', 'PROTEST_UPHELD', 'PROTEST_DISMISSED'];
    finishedStatuses.forEach((status) => {
      expect(getRasEventStatus({ rasStatus: status, eventOffTime: null })).toBe(SportEventStatuses.FINISHED);
    });
  });

  it('should return SUSPENDED when rasStatus is SUSPENDED', () => {
    expect(getRasEventStatus({ rasStatus: 'SUSPENDED', eventOffTime: null })).toBe(SportEventStatuses.SUSPENDED);
  });

  it('should return IN_PLAY when rasStatus is in inPlayStatuses', () => {
    const inPlayStatuses = ['CLOSE', 'FALSE_START', 'FINISHED', 'RESULTING', 'INTERIM', 'PROTEST'];
    inPlayStatuses.forEach((status) => {
      expect(getRasEventStatus({ rasStatus: status, eventOffTime: null })).toBe(SportEventStatuses.IN_PLAY);
    });
  });

  it('should return IN_PLAY when eventOffTime is defined and rasStatus is not finished or abandoned', () => {
    expect(getRasEventStatus({ rasStatus: 'OPEN', eventOffTime: '2025-06-10T12:00:00Z' })).toBe(
      SportEventStatuses.IN_PLAY,
    );
  });

  it('should return PRE_MATCH when rasStatus is in preMatchStatuses and eventOffTime is null', () => {
    const preMatchStatuses = ['OPEN', 'PARADING', 'GOING_DOWN', 'AT_THE_POST', 'GOING_BEHIND'];
    preMatchStatuses.forEach((status) => {
      expect(getRasEventStatus({ rasStatus: status, eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
    });
    expect(getRasEventStatus({ rasStatus: null, eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('should return PRE_MATCH by default when no other conditions match', () => {
    expect(getRasEventStatus({ rasStatus: 'UnknownStatus', eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('should return IN_PLAY when eventStartTime has passed and suspendAtEventOffTime is true', () => {
    const pastDate = '2020-06-24 10:00:00';

    expect(
      getRasEventStatus({
        rasStatus: 'OPEN',
        eventOffTime: null,
        eventStartTime: pastDate,
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return PRE_MATCH when eventStartTime has passed but suspendAtEventOffTime is false', () => {
    const pastDate = '2020-06-24 10:00:00';

    expect(
      getRasEventStatus({
        rasStatus: 'OPEN',
        eventOffTime: null,
        eventStartTime: pastDate,
        suspendAtEventOffTime: false,
      }),
    ).toBe(SportEventStatuses.PRE_MATCH);
  });
});
