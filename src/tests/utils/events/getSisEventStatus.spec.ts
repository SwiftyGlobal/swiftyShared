import { getSISEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getSISEventStatus', () => {
  it('should return FINISHED if isEventResulted is true', () => {
    expect(getSISEventStatus({ offTime: null, isEventResulted: true })).toBe(SportEventStatuses.FINISHED);
    expect(getSISEventStatus({ offTime: '2025-06-10T12:00:00Z', isEventResulted: true })).toBe(
      SportEventStatuses.FINISHED,
    );
  });

  it('should return IN_PLAY if offTime is defined and isEventResulted is false', () => {
    expect(getSISEventStatus({ offTime: '2025-06-10T12:00:00Z', isEventResulted: false })).toBe(
      SportEventStatuses.IN_PLAY,
    );
  });

  it('should return PRE_MATCH if offTime is null and isEventResulted is false', () => {
    expect(getSISEventStatus({ offTime: null, isEventResulted: false })).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('should return IN_PLAY if start time has passed and suspendAtEventOffTime is true', () => {
    const pastTime = '2024-06-30 01:00:00';

    expect(
      getSISEventStatus({
        offTime: null,
        isEventResulted: false,
        suspendAtEventOffTime: true,
        eventStartTime: pastTime,
      }),
    ).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return IN_PLAY off time has passed, if start time has passed and suspendAtEventOffTime is false and is resulted is false', () => {
    const pastTime = '2024-06-30 01:00:00';

    expect(
      getSISEventStatus({
        offTime: pastTime,
        isEventResulted: false,
        suspendAtEventOffTime: false,
        eventStartTime: pastTime,
      }),
    ).toBe(SportEventStatuses.IN_PLAY);
  });

  it('should return PRE_MATCH if offTime is null, event start time has passed and suspendAtEventOffTime is false', () => {
    const pastTime = '2024-06-30 01:00:00';

    expect(
      getSISEventStatus({
        offTime: null,
        isEventResulted: false,
        suspendAtEventOffTime: false,
        eventStartTime: pastTime,
      }),
    ).toBe(SportEventStatuses.PRE_MATCH);
  });
});
