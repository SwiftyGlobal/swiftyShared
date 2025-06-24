import type { Nullable } from '../../../types';

export interface GetPaMediaEventStatusDto {
  raceStatus: Nullable<string>;
  eventOffTime: Nullable<string>;
  suspendAtEventOffTime?: boolean;
}
