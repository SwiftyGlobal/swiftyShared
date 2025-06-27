import type { Nullable } from '../../../types';

export interface GetSisEventStatusDto {
  offTime: Nullable<string>;
  isEventResulted: boolean;
  suspendAtEventOffTime?: boolean;
  eventStartTime?: Nullable<string>;
}
