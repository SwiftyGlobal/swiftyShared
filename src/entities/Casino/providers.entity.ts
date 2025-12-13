import type { Nullable, MysqlBoolean } from '../../types';

/**
 * Casino DB Connection
 * Table: `providers`
 */
export interface CasinoProviders {
  id: number;
  slug: Nullable<string>;
  name: Nullable<string>;
  enable_websocket: Nullable<MysqlBoolean>;
  active: Nullable<MysqlBoolean>;
  multi_tenant: Nullable<MysqlBoolean>;
}
