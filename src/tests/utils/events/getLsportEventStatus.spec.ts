import { getLsportEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';

describe('getLsportEventStatus', () => {
  it('should return pre_match phase for PRE_MATCH status', () => {
    const eventStatusId = '1';

    const result = getLsportEventStatus({ eventStatusId });

    expect(result).toEqual({
      current_status: SportEventStatuses.PRE_MATCH,
      current_phase: 'pre_match',
    });
  });

  it('should return in_play phase for non-PRE_MATCH status', () => {
    const eventStatusId = '2';

    const result = getLsportEventStatus({ eventStatusId });

    expect(result).toEqual({
      current_status: SportEventStatuses.IN_PLAY,
      current_phase: 'in_play',
    });
  });
});
