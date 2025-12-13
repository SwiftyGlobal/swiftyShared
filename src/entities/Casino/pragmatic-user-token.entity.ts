import type { Nullable } from '../../types';

/**
 * Casino DB Connection
 * Table: `pragmaticUserToken`
 */
export interface PragmaticUserToken {
  id: number;
  user_id: string;
  token: string;
  game_slug: Nullable<string>;
  created_at: Date | string;
}
