import { getBetRadarEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getBetRadarEventStatus', () => {
  it.each<[string, SportEventStatuses, string]>([
    ['0', SportEventStatuses.PRE_MATCH, 'Pre Match'],
    ['1', SportEventStatuses.IN_PLAY, 'In Play'],
    ['2', SportEventStatuses.FINISHED, 'Finished'],
    ['3', SportEventStatuses.SUSPENDED, 'Suspended'],
    ['4', SportEventStatuses.CANCELLED, 'Cancelled'],
    ['5', SportEventStatuses.INTERRUPTED, 'Interrupted'],
    ['6', SportEventStatuses.POSTPONED, 'Postponed'],
    ['7', SportEventStatuses.DELAYED, 'Delayed'],
    ['8', SportEventStatuses.ABANDONED, 'Abandoned'],
    ['9', SportEventStatuses.RESCHEDULED, 'Rescheduled'],
  ])('maps BetRadar status id "%s" to %s', (eventStatusId, current_status, current_phase) => {
    expect(getBetRadarEventStatus({ eventStatusId })).toEqual({ current_status, current_phase });
  });

  it('falls back to pre_match for an unrecognised status id', () => {
    expect(getBetRadarEventStatus({ eventStatusId: '999' })).toEqual({
      current_status: SportEventStatuses.PRE_MATCH,
      current_phase: 'Pre Match',
    });
  });
});
