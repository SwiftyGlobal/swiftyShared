import { getBetRadarEventStatus } from '../../../utils';
import { SportEventStatuses } from '../../../common';
import type { GetBetRadarEventStatusDto } from '../../../common';

describe('getBetRadarEventStatus', () => {
  it('should return Pre Match status when eventStatusId is 1', () => {
    const payload: GetBetRadarEventStatusDto = {
      eventStatusId: '1',
    };

    const result = getBetRadarEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'In Play',
      current_status: SportEventStatuses.IN_PLAY,
    });
  });

  it('should return In Play status when eventStatusId is 2', () => {
    const payload: GetBetRadarEventStatusDto = {
      eventStatusId: '0',
    };

    const result = getBetRadarEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'Pre Match',
      current_status: SportEventStatuses.PRE_MATCH,
    });
  });

  it('should return Finished status when eventStatusId is 3', () => {
    const payload: GetBetRadarEventStatusDto = {
      eventStatusId: '3',
    };

    const result = getBetRadarEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'Finished',
      current_status: SportEventStatuses.FINISHED,
    });
  });

  it('should return Closed status when eventStatusId is 4', () => {
    const payload: GetBetRadarEventStatusDto = {
      eventStatusId: '4',
    };

    const result = getBetRadarEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'Closed',
      current_status: SportEventStatuses.CLOSED,
    });
  });

  it('should return Unknown status when eventStatusId is not recognized', () => {
    const payload: GetBetRadarEventStatusDto = {
      eventStatusId: '999',
    };

    const result = getBetRadarEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'Pre Match',
      current_status: SportEventStatuses.PRE_MATCH,
    });
  });
});
