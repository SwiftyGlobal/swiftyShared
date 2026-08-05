import { getLsportEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getLsportEventStatus', () => {
  it('should return pre_match phase for PRE_MATCH status', () => {
    const eventStatusId = '1';

    const result = getLsportEventStatus({ eventStatusId });

    expect(result).toEqual({
      current_status: SportEventStatuses.PRE_MATCH,
      current_phase: 'Pre-Match',
    });
  });

  it('should return in_play phase for non-PRE_MATCH status', () => {
    const eventStatusId = '2';

    const result = getLsportEventStatus({ eventStatusId });

    expect(result).toEqual({
      current_status: SportEventStatuses.IN_PLAY,
      current_phase: 'In-Play',
    });
  });

  // Previously every non-PRE_MATCH status was labelled "In Play"; the phase now carries the
  // status's own canonical label so an ended/cancelled L-Sports event no longer reads as live (#123).
  it.each([
    ['3', SportEventStatuses.FINISHED, 'Finished'],
    ['4', SportEventStatuses.CANCELLED, 'Cancelled'],
    ['8', SportEventStatuses.COVERAGE_LOST, 'Coverage Lost'],
  ])('should label status id %s with its own canonical phase', (eventStatusId, current_status, current_phase) => {
    expect(getLsportEventStatus({ eventStatusId })).toEqual({ current_status, current_phase });
  });

  it.each(['0', '99'])('should fall back to pre_match for unknown status id %s', (eventStatusId) => {
    const result = getLsportEventStatus({ eventStatusId });

    expect(result).toEqual({
      current_status: SportEventStatuses.PRE_MATCH,
      current_phase: 'Pre-Match',
    });
  });
});
