import type { Nullable } from '../../../types';

export interface GetRasEventStatusDto {
  rasStatus: Nullable<string>;
  eventOffTime: Nullable<string>;
  suspendAtEventOffTime?: boolean;
  eventStartTime?: Nullable<string>;
}
