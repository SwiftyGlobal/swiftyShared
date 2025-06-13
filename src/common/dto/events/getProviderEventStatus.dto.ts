import type { GetLSportEventStatusDto } from './getLSportEventStatus.dto';
import type { GetEveryMatrixEventStatusDto } from './getEveryMatrixEventStatus.dto';
import type { GetManualEventStatusDto } from './getManualEventStatus.dto';

export type GetProviderEventStatusDto =
  | GetEveryMatrixEventStatusDto
  | GetLSportEventStatusDto
  | GetManualEventStatusDto;
