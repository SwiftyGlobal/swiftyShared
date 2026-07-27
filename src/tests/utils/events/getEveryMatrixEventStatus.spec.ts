import { getEveryMatrixEventStatus } from '../../../utils';
import { SportEventStatuses, EveryMatrixPhase } from '../../../common';
import type { GetEveryMatrixEventStatusDto } from '../../../common';

describe('getEveryMatrixEventStatus', () => {
  it('should return Pre Match status when eventStatusId is "1"', () => {
    const payload: GetEveryMatrixEventStatusDto = {
      eventStatusId: '1',
      eventPartId: 12,
      eventStartTime: new Date(Date.now() + 10000).toISOString(),
      now: new Date().toISOString(),
    };

    const result = getEveryMatrixEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'Pre Match',
      current_status: SportEventStatuses.PRE_MATCH,
    });
  });

  it('should return In Play status when eventStatusId is not "1" and eventStartTime is in the past', () => {
    const payload: GetEveryMatrixEventStatusDto = {
      eventStatusId: '2',
      eventPartId: 5,
      eventStartTime: new Date(Date.now() - 10000).toISOString(),
      now: new Date().toISOString(),
    };

    const result = getEveryMatrixEventStatus(payload);

    expect(result).toEqual({
      current_phase: EveryMatrixPhase[5] ?? 'In Play',
      current_status: SportEventStatuses.IN_PLAY,
    });
  });

  it('should return Finished status when eventStatusId is "3"', () => {
    const payload: GetEveryMatrixEventStatusDto = {
      eventStatusId: '3',
      eventPartId: 99,
      eventStartTime: new Date(Date.now() - 10000).toISOString(),
      now: new Date().toISOString(),
    };

    const result = getEveryMatrixEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'Finished',
      current_status: SportEventStatuses.FINISHED,
    });
  });

  it('should default to In Play when current_phase is not set and eventStartTime is in the past', () => {
    const unknownId = 9999;

    const payload: GetEveryMatrixEventStatusDto = {
      eventStatusId: '2',
      eventPartId: unknownId,
      eventStartTime: new Date(Date.now() - 10000).toISOString(),
      now: new Date().toISOString(),
    };

    const result = getEveryMatrixEventStatus(payload);

    expect(result).toEqual({
      current_phase: 'In Play',
      current_status: SportEventStatuses.IN_PLAY,
    });
  });
});

describe('getEveryMatrixEventStatus - canonical status mapping', () => {
  const started = { eventStartTime: '2000-01-01T00:00:00.000Z', now: '2000-01-01T01:00:00.000Z' };

  it.each<[string, SportEventStatuses, string]>([
    ['4', SportEventStatuses.INTERRUPTED, 'Interrupted'],
    ['5', SportEventStatuses.CANCELLED, 'Cancelled'],
    ['6', SportEventStatuses.WALKOVER, 'Walkover'],
    ['7', SportEventStatuses.ABANDONED, 'Abandoned'],
    ['8', SportEventStatuses.RETIRED, 'Retired'],
  ])('maps EveryMatrix status id "%s" to %s regardless of part id', (eventStatusId, current_status, current_phase) => {
    const result = getEveryMatrixEventStatus({ eventStatusId, eventPartId: 9999, ...started });

    expect(result).toEqual({ current_status, current_phase });
  });
});
