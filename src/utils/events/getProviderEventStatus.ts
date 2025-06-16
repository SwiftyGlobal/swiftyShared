import type { EventPhaseStatus, IdWithProvider } from '../../types';
import { getManualEventPhaseStatus } from './getManualEventStatus';
import { getLsportEventStatus } from './getLsportEventStatus';
import { getEveryMatrixEventStatus } from './getEveryMatrixEventStatus';
import type {
  GetBetRadarEventStatusDto,
  GetEveryMatrixEventStatusDto,
  GetLSportEventStatusDto,
  GetManualEventStatusDto,
  GetProviderEventStatusDto,
} from '../../common';
import { SportEventStatuses } from '../../common';
import { getProviderWithoutId } from '../getProviderWithoutId';
import { getBetRadarEventStatus } from './getBetRadarEventStatus';

export const getProviderEventStatus = (
  eventId: IdWithProvider,
  payload: GetProviderEventStatusDto,
): EventPhaseStatus => {
  const provider = getProviderWithoutId(eventId);

  switch (provider) {
    case 'm':
      return getManualEventPhaseStatus(payload as GetManualEventStatusDto);
    case 'f':
      return getLsportEventStatus(payload as GetLSportEventStatusDto);
    case 'e':
      return getEveryMatrixEventStatus(payload as GetEveryMatrixEventStatusDto);
    case 'g':
      return getBetRadarEventStatus(payload as GetBetRadarEventStatusDto);
    default:
      return { current_phase: 'Pre Match', current_status: SportEventStatuses.PRE_MATCH };
  }
};
