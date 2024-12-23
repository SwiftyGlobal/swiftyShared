import type { SportEventStatuses } from '@common/constants';
import type { Nullable } from '@internal-types/nullable';

export interface EventPhaseStatus {
  current_phase: Nullable<string>;
  current_status: SportEventStatuses;
}
