import type { SportEventStatuses } from '../common';
import type { Nullable } from './nullable';

export interface EventPhaseStatus {
  current_phase: Nullable<string>;
  current_status: SportEventStatuses;
}
