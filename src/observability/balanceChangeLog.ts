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
  userId: number | string;
  playerId?: string | number | null;
  delta: number | string | null;
  oldBalance: number | string | null;
  newBalance: number | string | null;
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

function toFiniteOrNull(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function buildBalanceChangeLog(repo: BalanceChangeRepo, fields: BalanceChangeLogFields): Record<string, unknown> {
  return {
    tag: 'BALANCE_CHANGE',
    repo,
    userId: toFiniteOrNull(fields.userId),
    playerId: fields.playerId != null ? String(fields.playerId) : null,
    delta: toFiniteOrNull(fields.delta),
    oldBalance: toFiniteOrNull(fields.oldBalance),
    newBalance: toFiniteOrNull(fields.newBalance),
    source: fields.source || 'unknown',
    reason: fields.reason ?? null,
    ledgerTxId: fields.ledgerTxId ?? null,
    // NOTE: a ledgerTxId of 0 counts as paired; callers use DB insertIds (>=1) or null.
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
        // Still emit a minimal structured line so the write is findable via
        // `filter tag = "BALANCE_CHANGE"` even when full serialization fails.
        try {
          console.error(
            JSON.stringify({
              tag: 'BALANCE_CHANGE',
              repo,
              userId: toFiniteOrNull(fields?.userId),
              source: fields?.source || 'unknown',
              error: `emit_serialize_failed: ${(err as Error)?.message}`,
              ts: new Date().toISOString(),
            }),
          );
        } catch {
          console.error('BALANCE_CHANGE log emit failed');
        }
      }
    },
  };
}
