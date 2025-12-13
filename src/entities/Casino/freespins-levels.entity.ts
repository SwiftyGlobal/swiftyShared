import type { Nullable } from '../../types';

/**
 * Casino DB Connection
 * Table: `freespins_levels`
 */
export interface FreespinsLevel {
  id: number;
  game_id: Nullable<number>;
  game_slug: Nullable<string>;
  currency: Nullable<string>;
  lines: Nullable<number>;
  levels: Nullable<string>;
  default: Nullable<string>;
  gambling_limit: Nullable<string>;
  provider: Nullable<string>;
  type: Nullable<string>;
  feature: Nullable<string>;
  created_at: Nullable<Date | string>;
  modified_at: Nullable<Date | string>;
}
