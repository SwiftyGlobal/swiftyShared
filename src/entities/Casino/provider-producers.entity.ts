import type { Nullable, MysqlBoolean } from '../../types';

/**
 * Casino DB Connection
 * Table: `provider_producers`
 */
export interface ProviderProducer {
  id: number;
  provider: Nullable<string>;
  producer: Nullable<string>;
  name: Nullable<string>;
  last_sync: Nullable<Date | string>;
  sync_duration: Nullable<number>;
  currencies: Nullable<string>;
  active: Nullable<MysqlBoolean>;
  worker_period: Nullable<string>;
  black_list: Nullable<string>;
  white_list: Nullable<string>;
  fallback_currency: Nullable<string>;
  supported_currencies: Nullable<string>;
  configuration: Nullable<unknown>;
}
