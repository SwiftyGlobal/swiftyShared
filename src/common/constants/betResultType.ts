export enum BetResultType {
  LOSER = 'loser',
  OPEN = 'open',
  VOID = 'void',
  PARTIAL = 'partial',
  CASH_OUT = 'cash_out',
  WINNER = 'winner',
  PLACED = 'placed',
  HALF_LOST = 'half_lost',
  HALF_WON = 'half_won',
}

export const BetResultName: Record<BetResultType, string> = {
  [BetResultType.LOSER]: 'Lose',
  [BetResultType.OPEN]: 'Open',
  [BetResultType.VOID]: 'Void',
  [BetResultType.PARTIAL]: 'Partial',
  [BetResultType.CASH_OUT]: 'Cash Out',
  [BetResultType.WINNER]: 'Win',
  [BetResultType.PLACED]: 'Placed',
  [BetResultType.HALF_LOST]: 'Half Lost',
  [BetResultType.HALF_WON]: 'Half Won',
};

export enum LegacyBetResultType {
  LOSER = 'loser',
  LOSE = 'lose',
  LOST = 'lost',
  OPEN = 'open',
  VOID = 'void',
  PUSHED = 'pushed',
  PUSH = 'push',
  PARTIAL = 'partial',
  CASH_OUT = 'cash_out',
  WINNER = 'winner',
  WIN = 'win',
  WON = 'won',
  PLACED = 'placed',
  PLACE = 'place',
}

export const BetResultMap: Record<LegacyBetResultType, BetResultType> = {
  [LegacyBetResultType.LOSER]: BetResultType.LOSER,
  [LegacyBetResultType.LOSE]: BetResultType.LOSER,
  [LegacyBetResultType.LOST]: BetResultType.LOSER,
  [LegacyBetResultType.OPEN]: BetResultType.OPEN,
  [LegacyBetResultType.VOID]: BetResultType.VOID,
  [LegacyBetResultType.PUSHED]: BetResultType.VOID,
  [LegacyBetResultType.PUSH]: BetResultType.VOID,
  [LegacyBetResultType.PARTIAL]: BetResultType.PARTIAL,
  [LegacyBetResultType.CASH_OUT]: BetResultType.CASH_OUT,
  [LegacyBetResultType.WINNER]: BetResultType.WINNER,
  [LegacyBetResultType.WIN]: BetResultType.WINNER,
  [LegacyBetResultType.WON]: BetResultType.WINNER,
  [LegacyBetResultType.PLACED]: BetResultType.PLACED,
  [LegacyBetResultType.PLACE]: BetResultType.PLACED,
};
