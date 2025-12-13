import type { MysqlBoolean, Nullable } from '../../types';

/**
 * Main DB Connection
 * Table: `user_casino_bet`
 */
export interface UserCasinoBet {
  id: string;
  tx_type: string;
  user_id: string;
  game_id: Nullable<string>;
  game_title: Nullable<string>;
  round_id: Nullable<string>;
  amount: number;
  original_amount: number;
  reference: Nullable<string>;
  provider_id: string;
  created_at: Date | string;
  round_details: Nullable<string>;
  bonus_code: Nullable<string>;
  platform: Nullable<string>;
  language: Nullable<string>;
  jackpot_contribution: Nullable<string>;
  jackpot_details: Nullable<string>;
  jackpot_id: Nullable<string>;
  token: Nullable<string>;
  ip_address: Nullable<string>;
  casino_type: Nullable<string>;
  rate_exchange: Nullable<number>;
  transaction_id: Nullable<number>;
  currency: Nullable<string>;
  original_currency: Nullable<string>;
  request: Nullable<unknown>;
  affects_balance: Nullable<MysqlBoolean>;
  is_jackpot: Nullable<MysqlBoolean>;
  jackpot_type: Nullable<string>;
  license: Nullable<string>;
  session_id: Nullable<string>;
  processed_at: Nullable<Date | string>;
  processing: Nullable<number>;
}
