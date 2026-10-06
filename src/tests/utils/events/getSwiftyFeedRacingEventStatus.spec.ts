import { getSwiftyFeedRacingEventStatus } from '../../../utils';
import { EventStatuses, SportEventStatuses } from '../../../common';

describe('getSwiftyFeedRacingEventStatus', () => {
  it('maps the four feed words through EventStatuses.SWIFTY_FEED_RACING', () => {
    expect(EventStatuses.SWIFTY_FEED_RACING).toEqual({
      scheduled: SportEventStatuses.PRE_MATCH,
      in_progress: SportEventStatuses.IN_PLAY,
      completed: SportEventStatuses.FINISHED,
      cancelled: SportEventStatuses.ABANDONED,
    });
  });

  it('returns ABANDONED for cancelled, whatever else is set', () => {
    expect(
      getSwiftyFeedRacingEventStatus({ status: 'cancelled', resulted: 1, eventOffTime: '2026-10-05 14:00:00' }),
    ).toBe(SportEventStatuses.ABANDONED);
  });

  it('returns FINISHED for completed', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'completed', eventOffTime: null })).toBe(
      SportEventStatuses.FINISHED,
    );
  });

  it('returns FINISHED when resulted is set, as number, string or boolean', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'in_progress', resulted: 1, eventOffTime: null })).toBe(
      SportEventStatuses.FINISHED,
    );
    expect(getSwiftyFeedRacingEventStatus({ status: 'in_progress', resulted: '1', eventOffTime: null })).toBe(
      SportEventStatuses.FINISHED,
    );
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', resulted: true, eventOffTime: null })).toBe(
      SportEventStatuses.FINISHED,
    );
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', resulted: 0, eventOffTime: null })).toBe(
      SportEventStatuses.PRE_MATCH,
    );
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', resulted: '0', eventOffTime: null })).toBe(
      SportEventStatuses.PRE_MATCH,
    );
  });

  it('returns IN_PLAY for in_progress', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'in_progress', eventOffTime: null })).toBe(
      SportEventStatuses.IN_PLAY,
    );
  });

  it('returns IN_PLAY when off_time is set and the race is not finished or cancelled', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: '2026-10-05 14:00:00' })).toBe(
      SportEventStatuses.IN_PLAY,
    );
    expect(getSwiftyFeedRacingEventStatus({ status: null, eventOffTime: '2026-10-05 14:00:00' })).toBe(
      SportEventStatuses.IN_PLAY,
    );
  });

  it('returns PRE_MATCH for scheduled, null and unknown without an off time', () => {
    expect(getSwiftyFeedRacingEventStatus({ status: 'scheduled', eventOffTime: null })).toBe(
      SportEventStatuses.PRE_MATCH,
    );
    expect(getSwiftyFeedRacingEventStatus({ status: null, eventOffTime: null })).toBe(SportEventStatuses.PRE_MATCH);
    expect(getSwiftyFeedRacingEventStatus({ status: 'something_new', eventOffTime: null })).toBe(
      SportEventStatuses.PRE_MATCH,
    );
  });

  it('suspend-at-off: IN_PLAY once the start time has passed, PRE_MATCH before it, PRE_MATCH when the flag is off', () => {
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'scheduled',
        eventOffTime: null,
        eventStartTime: '2020-06-24 10:00:00',
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.IN_PLAY);
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'scheduled',
        eventOffTime: null,
        eventStartTime: '2099-06-24 10:00:00',
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.PRE_MATCH);
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'scheduled',
        eventOffTime: null,
        eventStartTime: '2020-06-24 10:00:00',
        suspendAtEventOffTime: false,
      }),
    ).toBe(SportEventStatuses.PRE_MATCH);
  });

  it('suspend-at-off does not override cancelled: ABANDONED once the start time has passed', () => {
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'cancelled',
        eventOffTime: null,
        eventStartTime: '2020-06-24 10:00:00',
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.ABANDONED);
  });

  it('suspend-at-off does not override completed or resulted: FINISHED once the start time has passed', () => {
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'completed',
        eventOffTime: null,
        eventStartTime: '2020-06-24 10:00:00',
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.FINISHED);
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'in_progress',
        resulted: 1,
        eventOffTime: null,
        eventStartTime: '2020-06-24 10:00:00',
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.FINISHED);
  });

  it('suspend-at-off before the start time leaves in_progress as IN_PLAY', () => {
    expect(
      getSwiftyFeedRacingEventStatus({
        status: 'in_progress',
        eventOffTime: null,
        eventStartTime: '2099-06-24 10:00:00',
        suspendAtEventOffTime: true,
      }),
    ).toBe(SportEventStatuses.IN_PLAY);
  });
});
