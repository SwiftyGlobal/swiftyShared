import type { Nullable } from '../../types';

/**
 * Casino DB Connection
 * Table: `player_currency`
 */
export interface PlayerCurrency {
  id: number;
  sub_id: Nullable<string>;
  player_id: Nullable<string>;
  currency: Nullable<string>;
}
