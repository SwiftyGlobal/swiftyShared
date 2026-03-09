# MySQL Pool Monitor

Use `registerPoolForMonitoring` right after creating each `mysql2/promise` pool.

## API

```ts
registerPoolForMonitoring({
  poolName,
  pool,
  config,
  intervalMs,
  totalConnectionsThreshold,
  events,
});
```

- `poolName`: unique pool label in logs.
- `pool`: `mysql2/promise` pool instance.
- `config.connectionLimit`: value logged in `mysql_pool_created`.
- `intervalMs` (optional): overrides monitor interval.
- `totalConnectionsThreshold` (optional): emits anomaly event when current `totalConnections` is greater than this value. Default is `300`.
- `events` (optional): per-pool event toggles.
  - `created`
  - `stats`
  - `statsError`
  - `thresholdExceeded`

## Logged events

- `mysql_pool_created`
- `mysql_pool_stats`
- `mysql_pool_stats_error`
- `mysql_pool_connections_threshold_exceeded`

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
  totalConnectionsThreshold: 18,
  events: {
    created: true,
    stats: true,
    statsError: true,
    thresholdExceeded: true,
  },
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
  totalConnectionsThreshold: 18,
  events: {
    stats: true,
    thresholdExceeded: true,
  },
});
```

## Interval configuration

Default interval resolution:
1. `intervalMs` argument
2. `process.env.MYSQL_POOL_MONITOR_INTERVAL_MS`
3. `60000`
