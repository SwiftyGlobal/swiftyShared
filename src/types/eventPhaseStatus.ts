import type { SportEventStatuses } from '@constants/sportEventStatuses';
import type { Nullable } from '@internal-types/nullable';

export interface EventPhaseStatus {
  current_phase: Nullable<string>;
  current_status: SportEventStatuses;
}
