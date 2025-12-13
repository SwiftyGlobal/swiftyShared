import type { Nullable, MysqlBoolean } from '../../types';

/**
 * Casino DB Connection
 * Table: `user_session`
 */
export interface UserSession {
  id: number;
  sub_id: Nullable<string>;
  open: Nullable<MysqlBoolean>;
  timestamp: Nullable<Date | string>;
  created_at: Nullable<Date | string>;
  modified_at: Nullable<Date | string>;
  session_id: Nullable<string>;
  game_id: Nullable<string>;
  is_free_spin: Nullable<MysqlBoolean>;
  game_type: Nullable<string>;
  ip_address: Nullable<string>;
  currency: Nullable<string>;
}
