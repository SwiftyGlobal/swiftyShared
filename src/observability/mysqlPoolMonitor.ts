const MYSQL_POOL_MONITOR_GLOBAL_KEY = '__SWIFTY_MYSQL_POOL_MONITOR__';
const DEFAULT_MONITOR_INTERVAL_MS = 60000;
const DEFAULT_TOTAL_CONNECTIONS_THRESHOLD = 300;

type Mysql2PoolInternals = {
  _allConnections?: { length?: number };
  _freeConnections?: { length?: number };
  _connectionQueue?: { length?: number };
};

type Mysql2PromisePoolLike = {
  pool?: Mysql2PoolInternals;
};

type PoolMonitorConfig = {
  connectionLimit?: number;
};

type PoolMonitorEventsConfig = {
  created?: boolean;
  stats?: boolean;
  statsError?: boolean;
  thresholdExceeded?: boolean;
};

type RegisterPoolForMonitoringPayload = {
  poolName: string;
  pool: Mysql2PromisePoolLike;
  config?: PoolMonitorConfig;
  intervalMs?: number;
  totalConnectionsThreshold?: number;
  events?: PoolMonitorEventsConfig;
};

type RegisteredPool = {
  poolName: string;
  pool: Mysql2PromisePoolLike;
  totalConnectionsThreshold?: number;
  events: Required<PoolMonitorEventsConfig>;
};

type GlobalPoolMonitorState = {
  pools: Record<string, RegisteredPool>;
  intervalStarted: boolean;
};

type GlobalWithPoolMonitor = typeof globalThis & {
  __SWIFTY_MYSQL_POOL_MONITOR__?: GlobalPoolMonitorState;
};

const getGlobalState = (): GlobalPoolMonitorState => {
  const globalState = global as GlobalWithPoolMonitor;

  if (!globalState[MYSQL_POOL_MONITOR_GLOBAL_KEY]) {
    globalState[MYSQL_POOL_MONITOR_GLOBAL_KEY] = {
      pools: {},
      intervalStarted: false,
    };
  }

  return globalState[MYSQL_POOL_MONITOR_GLOBAL_KEY] as GlobalPoolMonitorState;
};

const parseIntervalMs = (intervalMs?: number): number => {
  if (typeof intervalMs === 'number' && Number.isFinite(intervalMs) && intervalMs > 0) {
    return intervalMs;
  }

  const intervalFromEnv = Number(process.env.MYSQL_POOL_MONITOR_INTERVAL_MS);

  if (Number.isFinite(intervalFromEnv) && intervalFromEnv > 0) {
    return intervalFromEnv;
  }

  return DEFAULT_MONITOR_INTERVAL_MS;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const resolveEventsConfig = (events?: PoolMonitorEventsConfig): Required<PoolMonitorEventsConfig> => ({
  created: events?.created ?? true,
  stats: events?.stats ?? true,
  statsError: events?.statsError ?? true,
  thresholdExceeded: events?.thresholdExceeded ?? true,
});

const resolveTotalConnectionsThreshold = (totalConnectionsThreshold?: number): number => {
  if (typeof totalConnectionsThreshold === 'number' && Number.isFinite(totalConnectionsThreshold)) {
    return totalConnectionsThreshold;
  }

  return DEFAULT_TOTAL_CONNECTIONS_THRESHOLD;
};

const logPoolStats = (): void => {
  const globalState = getGlobalState();
  const pools = Object.values(globalState.pools);

  pools.forEach(({ poolName, pool, totalConnectionsThreshold, events }) => {
    try {
      const totalConnections = pool?.pool?._allConnections?.length ?? 0;
      const freeConnections = pool?.pool?._freeConnections?.length ?? 0;
      const queuedRequests = pool?.pool?._connectionQueue?.length ?? 0;

      if (events.stats) {
        console.log(
          JSON.stringify({
            event: 'mysql_pool_stats',
            pid: process.pid,
            timestamp: new Date().toISOString(),
            poolName,
            totalConnections,
            freeConnections,
            queuedRequests,
          }),
        );
      }

      if (
        events.thresholdExceeded &&
        typeof totalConnectionsThreshold === 'number' &&
        Number.isFinite(totalConnectionsThreshold) &&
        totalConnections > totalConnectionsThreshold
      ) {
        console.error(
          JSON.stringify({
            event: 'mysql_pool_connections_threshold_exceeded',
            pid: process.pid,
            timestamp: new Date().toISOString(),
            poolName,
            totalConnections,
            freeConnections,
            queuedRequests,
            threshold: totalConnectionsThreshold,
          }),
        );
      }
    } catch (error) {
      if (events.statsError) {
        console.error(
          JSON.stringify({
            event: 'mysql_pool_stats_error',
            pid: process.pid,
            timestamp: new Date().toISOString(),
            error: getErrorMessage(error),
          }),
        );
      }
    }
  });
};

export const registerPoolForMonitoring = ({
  poolName,
  pool,
  config,
  intervalMs,
  totalConnectionsThreshold,
  events,
}: RegisterPoolForMonitoringPayload): void => {
  const globalState = getGlobalState();

  globalState.pools[poolName] = {
    poolName,
    pool,
    totalConnectionsThreshold: resolveTotalConnectionsThreshold(totalConnectionsThreshold),
    events: resolveEventsConfig(events),
  };

  if (globalState.pools[poolName].events.created) {
    console.log(
      JSON.stringify({
        event: 'mysql_pool_created',
        pid: process.pid,
        timestamp: new Date().toISOString(),
        poolName,
        connectionLimit: config?.connectionLimit ?? 0,
      }),
    );
  }

  if (!globalState.intervalStarted) {
    globalState.intervalStarted = true;

    const timer = setInterval(logPoolStats, parseIntervalMs(intervalMs));

    if (typeof timer.unref === 'function') {
      timer.unref();
    }
  }
};
