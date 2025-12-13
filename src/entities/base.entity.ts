import type { Nullable } from '../types';

/**
 * Represents a base entity with common fields.
 */
export interface BaseEntity {
  id: string;
  created_at: Nullable<Date | string>;
  created_by: Nullable<string>;
  modified_at: Nullable<Date | string>;
  modified_by: Nullable<string>;
}
