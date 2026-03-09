const MYSQL_POOL_MONITOR_GLOBAL_KEY = '__SWIFTY_MYSQL_POOL_MONITOR__';

describe('registerPoolForMonitoring', () => {
  beforeEach(() => {
    delete (global as Record<string, unknown>)[MYSQL_POOL_MONITOR_GLOBAL_KEY];
    delete process.env.MYSQL_POOL_MONITOR_INTERVAL_MS;

    jest.restoreAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('starts only one interval after multiple registrations', async () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    const { registerPoolForMonitoring } = await import('../../observability/mysqlPoolMonitor');

    registerPoolForMonitoring({
      poolName: 'pool_one',
      pool: { pool: {} },
      config: { connectionLimit: 10 },
      intervalMs: 5000,
    });

    registerPoolForMonitoring({
      poolName: 'pool_two',
      pool: { pool: {} },
      config: { connectionLimit: 20 },
      intervalMs: 1000,
    });

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('logs created and stats events with correct payload', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { registerPoolForMonitoring } = await import('../../observability/mysqlPoolMonitor');

    registerPoolForMonitoring({
      poolName: 'main_pool',
      pool: {
        pool: {
          _allConnections: { length: 5 },
          _freeConnections: { length: 2 },
          _connectionQueue: { length: 3 },
        },
      },
      config: { connectionLimit: 10 },
      intervalMs: 1000,
    });

    expect(logSpy).toHaveBeenCalledTimes(1);

    const createdEvent = JSON.parse(logSpy.mock.calls[0][0]);

    expect(createdEvent.event).toBe('mysql_pool_created');
    expect(createdEvent.pid).toBe(process.pid);
    expect(createdEvent.poolName).toBe('main_pool');
    expect(createdEvent.connectionLimit).toBe(10);
    expect(new Date(createdEvent.timestamp).toISOString()).toBe(createdEvent.timestamp);

    jest.advanceTimersByTime(1000);

    expect(logSpy).toHaveBeenCalledTimes(2);

    const statsEvent = JSON.parse(logSpy.mock.calls[1][0]);

    expect(statsEvent.event).toBe('mysql_pool_stats');
    expect(statsEvent.pid).toBe(process.pid);
    expect(statsEvent.poolName).toBe('main_pool');
    expect(statsEvent.totalConnections).toBe(5);
    expect(statsEvent.freeConnections).toBe(2);
    expect(statsEvent.queuedRequests).toBe(3);
    expect(new Date(statsEvent.timestamp).toISOString()).toBe(statsEvent.timestamp);
  });

  it('logs stats error event when stats collection fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const { registerPoolForMonitoring } = await import('../../observability/mysqlPoolMonitor');

    const brokenPool = {
      get pool() {
        throw new Error('stats exploded');
      },
    };

    registerPoolForMonitoring({
      poolName: 'broken_pool',
      pool: brokenPool as any,
      config: { connectionLimit: 4 },
      intervalMs: 1000,
    });

    jest.advanceTimersByTime(1000);

    expect(errorSpy).toHaveBeenCalledTimes(1);

    const errorEvent = JSON.parse(errorSpy.mock.calls[0][0]);

    expect(errorEvent.event).toBe('mysql_pool_stats_error');
    expect(errorEvent.pid).toBe(process.pid);
    expect(errorEvent.error).toBe('stats exploded');
    expect(new Date(errorEvent.timestamp).toISOString()).toBe(errorEvent.timestamp);
  });

  it('logs stats independently for multiple pool names', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { registerPoolForMonitoring } = await import('../../observability/mysqlPoolMonitor');

    registerPoolForMonitoring({
      poolName: 'read_pool',
      pool: {
        pool: {
          _allConnections: { length: 2 },
          _freeConnections: { length: 1 },
          _connectionQueue: { length: 0 },
        },
      },
      config: { connectionLimit: 5 },
      intervalMs: 1000,
    });

    registerPoolForMonitoring({
      poolName: 'write_pool',
      pool: {
        pool: {
          _allConnections: { length: 8 },
          _freeConnections: { length: 3 },
          _connectionQueue: { length: 6 },
        },
      },
      config: { connectionLimit: 10 },
      intervalMs: 1000,
    });

    jest.advanceTimersByTime(1000);

    const statsEvents = logSpy.mock.calls
      .map((call) => JSON.parse(call[0]))
      .filter((event) => event.event === 'mysql_pool_stats');

    expect(statsEvents).toHaveLength(2);
    expect(statsEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          poolName: 'read_pool',
          totalConnections: 2,
          freeConnections: 1,
          queuedRequests: 0,
        }),
        expect.objectContaining({
          poolName: 'write_pool',
          totalConnections: 8,
          freeConnections: 3,
          queuedRequests: 6,
        }),
      ]),
    );
  });
});
