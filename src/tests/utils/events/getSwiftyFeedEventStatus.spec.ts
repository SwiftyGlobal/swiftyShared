import { getProviderEventStatus, getSwiftyFeedEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getSwiftyFeedEventStatus', () => {
  it.each<[string, SportEventStatuses, string]>([
    ['1', SportEventStatuses.PRE_MATCH, 'Pre-Match'],
    ['2', SportEventStatuses.IN_PLAY, 'In-Play'],
    ['3', SportEventStatuses.FINISHED, 'Finished'],
  ])('maps swifty-feed status id "%s" to %s', (eventStatusId, current_status, current_phase) => {
    expect(getSwiftyFeedEventStatus({ eventStatusId })).toEqual({ current_status, current_phase });
  });

  // The feed stores event_status_id as a MySQL INT, so mysql2 hands it back as a number.
  // Mapping by string alone would silently fall back to pre_match for every live event.
  it.each<[number, SportEventStatuses, string]>([
    [1, SportEventStatuses.PRE_MATCH, 'Pre-Match'],
    [2, SportEventStatuses.IN_PLAY, 'In-Play'],
    [3, SportEventStatuses.FINISHED, 'Finished'],
  ])('maps numeric swifty-feed status id %s to %s', (eventStatusId, current_status, current_phase) => {
    expect(getSwiftyFeedEventStatus({ eventStatusId })).toEqual({ current_status, current_phase });
  });

  it('falls back to pre_match for an unrecognised status id', () => {
    expect(getSwiftyFeedEventStatus({ eventStatusId: '99' })).toEqual({
      current_status: SportEventStatuses.PRE_MATCH,
      current_phase: 'Pre-Match',
    });
  });

  // Regression: an 's'-prefixed id used to fall through to the dispatcher's default branch,
  // which returned pre_match for every feed event no matter what the feed said.
  describe('dispatched through getProviderEventStatus', () => {
    it('resolves an in-progress feed event as in_play', () => {
      expect(getProviderEventStatus('s-180', { eventStatusId: 2 })).toEqual({
        current_status: SportEventStatuses.IN_PLAY,
        current_phase: 'In-Play',
      });
    });

    it('resolves a scheduled feed event as pre_match', () => {
      expect(getProviderEventStatus('s-180', { eventStatusId: 1 })).toEqual({
        current_status: SportEventStatuses.PRE_MATCH,
        current_phase: 'Pre-Match',
      });
    });

    it('resolves a completed feed event as finished', () => {
      expect(getProviderEventStatus('s-180', { eventStatusId: 3 })).toEqual({
        current_status: SportEventStatuses.FINISHED,
        current_phase: 'Finished',
      });
    });
  });
});
