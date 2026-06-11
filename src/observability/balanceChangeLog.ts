/**
 * Structured BALANCE_CHANGE logging — the single shared implementation for
 * backoffice / casino / gaming / elbapi (spec 2026-06-10-balance-change-logging).
 *
 * One log line per users.balance write, emitted to stdout (-> CloudWatch).
 * Query in CloudWatch Logs Insights via: filter tag = "BALANCE_CHANGE".
 * `ledgerPaired:false` flags a wallet write with no users_transaction row —
 * the failure mode behind CheckUserBalance wallet/ledger drift.
 *
 * emit() must NEVER throw into the caller: the audit log must not become a
 * new way to break a real-money flow.
 */
export type BalanceChangeRepo = 'backoffice' | 'casino' | 'gaming' | 'elbapi';

export interface BalanceChangeLogFields {
  userId: number;
  playerId?: string | number | null;
  delta: number | null;
  oldBalance: number | null;
  newBalance: number | null;
  source: string;
  reason?: string | null;
  ledgerTxId?: string | number | null;
  betId?: string | number | null;
  currency?: string | null;
  error?: string;
}

export interface BalanceChangeLogger {
  build: (fields: BalanceChangeLogFields) => Record<string, unknown>;
  emit: (fields: BalanceChangeLogFields) => void;
}

export function buildBalanceChangeLog(repo: BalanceChangeRepo, fields: BalanceChangeLogFields): Record<string, unknown> {
  return {
    tag: 'BALANCE_CHANGE',
    repo,
    userId: fields.userId != null ? Number(fields.userId) : null,
    playerId: fields.playerId != null ? String(fields.playerId) : null,
    delta: fields.delta != null ? Number(fields.delta) : null,
    oldBalance: fields.oldBalance != null ? Number(fields.oldBalance) : null,
    newBalance: fields.newBalance != null ? Number(fields.newBalance) : null,
    source: fields.source || 'unknown',
    reason: fields.reason ?? null,
    ledgerTxId: fields.ledgerTxId ?? null,
    ledgerPaired: fields.ledgerTxId != null,
    betId: fields.betId ?? null,
    currency: fields.currency ?? null,
    error: fields.error,
    ts: new Date().toISOString(),
  };
}

export function createBalanceChangeLogger(repo: BalanceChangeRepo): BalanceChangeLogger {
  return {
    build: (fields) => buildBalanceChangeLog(repo, fields),
    emit: (fields) => {
      try {
        console.log(JSON.stringify(buildBalanceChangeLog(repo, fields)));
      } catch (err) {
        console.error('BALANCE_CHANGE log emit failed:', (err as Error)?.message);
      }
    },
  };
}
