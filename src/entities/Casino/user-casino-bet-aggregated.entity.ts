import type { Nullable } from '../../types';

/**
 * Main DB Connection
 * Table: `user_casino_bet_aggregated`
 */
export interface UserCasinoBetAggregated {
  id: number;
  user_id: Nullable<string>;
  game_slug: Nullable<string>;
  provider_id: Nullable<string>;
  tx_type: Nullable<string>;
  transaction_id: Nullable<string>;
  created_at: Nullable<Date | string>;
  modified_at: Nullable<Date | string>;
  bet_counter: Nullable<number>;
  free_bet_id: Nullable<number>;
}
