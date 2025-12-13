import type { Nullable, MysqlBoolean } from '../../types';

/**
 * Casino DB Connection
 * Table: `casino_games`
 */
export interface CasinoGame {
  id: number;
  title: Nullable<string>;
  slug: Nullable<string>;
  provider: Nullable<string>;
  producer: Nullable<string>;
  details: Nullable<string>;
  details_2: Nullable<unknown>;
  black_list: Nullable<string>;
  white_list: Nullable<string>;
  active: Nullable<MysqlBoolean>;
  published: MysqlBoolean;
  category: Nullable<string>;
  platform: Nullable<string>;
  default_image: Nullable<MysqlBoolean>;
  has_demo: Nullable<MysqlBoolean>;
  web_image_url: Nullable<string>;
  banner_url: Nullable<string>;
  is_live: Nullable<MysqlBoolean>;
  created_at: Nullable<Date | string>;
  modified_at: Nullable<Date | string>;
  currencies: Nullable<string>;
  mobile_image_url: Nullable<string>;
  has_freespins: Nullable<MysqlBoolean>;
  freespins_configured: Nullable<MysqlBoolean>;
  default_image_mobile: Nullable<MysqlBoolean>;
  web_image_url_upscaled: Nullable<string>;
  mobile_image_url_upscaled: Nullable<string>;
  type: Nullable<string>;
  jackpot_amount: Nullable<string>;
  table_id: Nullable<string>;
  raw_details: Nullable<unknown>;
  mini_mode: Nullable<MysqlBoolean>;
}
