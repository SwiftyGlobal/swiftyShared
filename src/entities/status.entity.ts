import type { Nullable } from '../types';
import type { BaseEntity } from './base.entity';

/**
 * Represents a status entity with common fields.
 * to be used for tracking status information as array of json objects with status name and timestamps.
 */
export interface StatusEntity extends BaseEntity {
  status: string;
  reason?: Nullable<string>;
}
