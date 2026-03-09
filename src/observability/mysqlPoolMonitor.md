# MySQL Pool Monitor

Use `registerPoolForMonitoring` right after creating each `mysql2/promise` pool.

## API

```ts
registerPoolForMonitoring({
  poolName,
  pool,
  config,
  intervalMs,
});
```

- `poolName`: unique pool label in logs.
- `pool`: `mysql2/promise` pool instance.
- `config.connectionLimit`: value logged in `mysql_pool_created`.
- `intervalMs` (optional): overrides monitor interval.

## Logged events

- `mysql_pool_created`
- `mysql_pool_stats`
- `mysql_pool_stats_error`

All logs are single-line JSON.

## TypeScript example

```ts
import { createPool } from 'mysql2/promise';
import { registerPoolForMonitoring } from '@swiftyglobal/swifty-shared';

const connectionLimit = 20;
const mainPool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit,
});

registerPoolForMonitoring({
  poolName: 'main_mysql_pool',
  pool: mainPool,
  config: { connectionLimit },
  intervalMs: 60000,
});
```

## JavaScript example

```js
const { createPool } = require('mysql2/promise');
const { registerPoolForMonitoring } = require('@swiftyglobal/swifty-shared');

const connectionLimit = 20;
const mainPool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit,
});

registerPoolForMonitoring({
  poolName: 'main_mysql_pool',
  pool: mainPool,
  config: { connectionLimit },
});
```

## Interval configuration

Default interval resolution:
1. `intervalMs` argument
2. `process.env.MYSQL_POOL_MONITOR_INTERVAL_MS`
3. `60000`
