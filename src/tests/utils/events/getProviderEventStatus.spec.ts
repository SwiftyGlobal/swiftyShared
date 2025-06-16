import { getProviderEventStatus } from '../../../utils';
import { getBetRadarEventStatus, getManualEventPhaseStatus } from '../../../utils';
import { getLsportEventStatus } from '../../../utils';
import { getEveryMatrixEventStatus } from '../../../utils';
import { getProviderWithoutId } from '../../../utils';
import type {
  GetBetRadarEventStatusDto,
  GetEveryMatrixEventStatusDto,
  GetLSportEventStatusDto,
  GetManualEventStatusDto,
} from '../../../common';
import { SportEventStatuses } from '../../../common';
import type { EventPhaseStatus } from '../../../types';

jest.mock('../../../utils/getProviderWithoutId');
jest.mock('../../../utils/events/getManualEventStatus');
jest.mock('../../../utils/events/getLsportEventStatus');
jest.mock('../../../utils/events/getEveryMatrixEventStatus');
jest.mock('../../../utils/events/getBetRadarEventStatus');

describe('getProviderEventStatus', () => {
  const mockGetProviderWithoutId = getProviderWithoutId as jest.Mock;
  const mockGetManualEventPhaseStatus = getManualEventPhaseStatus as jest.Mock;
  const mockGetLsportEventStatus = getLsportEventStatus as jest.Mock;
  const mockGetEveryMatrixEventStatus = getEveryMatrixEventStatus as jest.Mock;
  const mockGetBetRadarEventStatus = getBetRadarEventStatus as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call getManualEventPhaseStatus for provider m', () => {
    mockGetProviderWithoutId.mockReturnValue('m');
    const payload: GetManualEventStatusDto = { eventPhase: 'InPlay' };
    const expectedResult: EventPhaseStatus = { current_phase: 'InPlay', current_status: SportEventStatuses.IN_PLAY };
    mockGetManualEventPhaseStatus.mockReturnValue(expectedResult);

    const result = getProviderEventStatus('m-123', payload);

    expect(mockGetProviderWithoutId).toHaveBeenCalledWith('m-123');
    expect(mockGetManualEventPhaseStatus).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expectedResult);
  });

  it('should call getLsportEventStatus for provider f', () => {
    mockGetProviderWithoutId.mockReturnValue('f');
    const payload: GetLSportEventStatusDto = { eventStatusId: '2' };
    const expectedResult: EventPhaseStatus = { current_phase: 'in_play', current_status: SportEventStatuses.IN_PLAY };
    mockGetLsportEventStatus.mockReturnValue(expectedResult);

    const result = getProviderEventStatus('f-123', payload);

    expect(mockGetProviderWithoutId).toHaveBeenCalledWith('f-123');
    expect(mockGetLsportEventStatus).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expectedResult);
  });

  it('should call getEveryMatrixEventStatus for provider e', () => {
    mockGetProviderWithoutId.mockReturnValue('e');
    const payload: GetEveryMatrixEventStatusDto = {
      eventStatusId: 'statusId',
      eventPartId: 1,
      eventStartTime: '2025-06-13T12:00:00Z',
      now: '2025-06-13T12:30:00Z',
    };
    const expectedResult: EventPhaseStatus = {
      current_phase: 'pre_match',
      current_status: SportEventStatuses.PRE_MATCH,
    };
    mockGetEveryMatrixEventStatus.mockReturnValue(expectedResult);

    const result = getProviderEventStatus('e-123', payload);

    expect(mockGetProviderWithoutId).toHaveBeenCalledWith('e-123');
    expect(mockGetEveryMatrixEventStatus).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expectedResult);
  });

  it('should call getBetRadar for provider g', () => {
    mockGetProviderWithoutId.mockReturnValue('g');
    const payload: GetBetRadarEventStatusDto = {
      eventStatusId: '0',
    };

    const expectedResult: EventPhaseStatus = {
      current_phase: 'Pre Match',
      current_status: SportEventStatuses.PRE_MATCH,
    };

    mockGetBetRadarEventStatus.mockReturnValue(expectedResult);

    const result = getProviderEventStatus('g-123', payload);

    expect(mockGetProviderWithoutId).toHaveBeenCalledWith('g-123');
    expect(mockGetBetRadarEventStatus).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expectedResult);
  });

  it('should return default status for unknown provider', () => {
    mockGetProviderWithoutId.mockReturnValue('unknown');
    const payload = {};

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = getProviderEventStatus('x-123', payload);

    expect(mockGetProviderWithoutId).toHaveBeenCalledWith('x-123');
    expect(result).toEqual({
      current_phase: 'Pre Match',
      current_status: SportEventStatuses.PRE_MATCH,
    });
  });
});
