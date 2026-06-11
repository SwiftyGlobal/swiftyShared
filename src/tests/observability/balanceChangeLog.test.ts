import { buildBalanceChangeLog, createBalanceChangeLogger } from '../../observability/balanceChangeLog';

describe('balanceChangeLog', () => {
  it('builds the full contract shape', () => {
    const log = buildBalanceChangeLog('gaming', {
      userId: 175,
      playerId: 3443,
      delta: -3,
      oldBalance: 99.24,
      newBalance: 96.24,
      source: 'betPlacer.placeBets',
      reason: 'bet_slip_place_lucky15',
      ledgerTxId: 8911144,
      betId: 445727,
      currency: 'GBP',
    });
    expect(log).toMatchObject({
      tag: 'BALANCE_CHANGE',
      repo: 'gaming',
      userId: 175,
      playerId: '3443', // stringified
      delta: -3,
      oldBalance: 99.24,
      newBalance: 96.24,
      source: 'betPlacer.placeBets',
      reason: 'bet_slip_place_lucky15',
      ledgerTxId: 8911144,
      ledgerPaired: true,
      betId: 445727,
      currency: 'GBP',
    });
    expect(log.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(log.error).toBeUndefined();
  });

  it('marks unpaired changes and nulls unknown fields', () => {
    const log = buildBalanceChangeLog('casino', { userId: 1, delta: 5, oldBalance: null, newBalance: null, source: 'x' });
    expect(log.ledgerPaired).toBe(false);
    expect(log.ledgerTxId).toBeNull();
    expect(log.playerId).toBeNull();
    expect(log.currency).toBeNull();
    expect(log.reason).toBeNull();
    expect(log.betId).toBeNull();
  });

  it('defaults a missing source to "unknown" instead of throwing', () => {
    const log = buildBalanceChangeLog('elbapi', { userId: 1, delta: 1, oldBalance: 0, newBalance: 1, source: '' });
    expect(log.source).toBe('unknown');
  });

  it('factory binds the repo and emit logs one JSON line', () => {
    const logger = createBalanceChangeLogger('backoffice');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.emit({ userId: 2, delta: 1.5, oldBalance: 10, newBalance: 11.5, source: 'manualAdjustment' });
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed).toMatchObject({ tag: 'BALANCE_CHANGE', repo: 'backoffice', userId: 2, newBalance: 11.5 });
    spy.mockRestore();
  });

  it('emit never throws, even on unserializable input', () => {
    const logger = createBalanceChangeLogger('gaming');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const spyErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      logger.emit({ userId: 1, delta: 1, oldBalance: 0, newBalance: 1, source: 'x', betId: circular as never }),
    ).not.toThrow();
    spyErr.mockRestore();
  });
});
