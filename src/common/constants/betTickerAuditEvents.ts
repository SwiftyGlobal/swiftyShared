export enum BetTickerAuditEvent {
  CREATED = 'created',
  TRADER_ASSIGNED = 'trader_assigned',
  TRADER_REASSIGNED = 'trader_reassigned',
  TRADER_UNASSIGNED = 'trader_unassigned',
  OFFER_MADE = 'offer_made',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  CMS_APPROVED = 'cms_approved',
  CMS_REJECTED = 'cms_rejected',
  AUTO_CANCELLED = 'auto_cancelled',
  AUTO_EXPIRED = 'auto_expired',
  DISCONNECT_REJECTED = 'disconnect_rejected',
  FLAG_CHANGED = 'flag_changed',
  BET_USED = 'bet_used',
}

export const BET_TICKER_AUDIT_EVENT_VALUES: ReadonlySet<string> = new Set(Object.values(BetTickerAuditEvent));

export enum BetTickerAuditActor {
  SYSTEM = 'system',
  PLAYER = 'player',
  CMS_USER = 'cms_user',
}

export const BET_TICKER_AUDIT_ACTOR_VALUES: ReadonlySet<string> = new Set(Object.values(BetTickerAuditActor));

export const BET_TICKER_AUDIT_ACTOR_LABEL: Readonly<Record<BetTickerAuditActor, string>> = {
  [BetTickerAuditActor.PLAYER]: 'Player',
  [BetTickerAuditActor.CMS_USER]: 'Trader',
  [BetTickerAuditActor.SYSTEM]: 'System',
};
