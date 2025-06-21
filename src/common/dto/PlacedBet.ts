import type { BetResultType } from '../constants/betResultType';
import type { BetSlipType } from '../constants/betSlipType';

export interface PlacedBetSelection {
  bet_id: number;
  stake: number;
  result: BetResultType;
  is_starting_price: boolean;
  is_each_way: boolean;
  sp_odd_fractional: string | null;
  odd_fractional: string | null;
  sp_odd_decimal: number;
  odd_decimal: number;
  ew_terms: string | null;
  partial_win_percent: number | null;
  rule_4: number | null;
}

export interface PlacedBet {
  selections: PlacedBetSelection[];
  stake: number;
  total_stake: number;
  bet_type: string;
  free_bet_amount: number;
  bog_applicable: boolean;
}

export interface Selection {
  selection_id: number;
  result: BetResultType;
  position: number;
  dead_heat_count: number | null; // number of horses to share the place prize
  partial_percent: number | null;
  each_way_places: string | null;
  each_way_terms: string | null;
}

export interface BetSettings {
  selections: Selection[];
  bets: PlacedBetSelection[];
  bog_max_payout: number;
  stake: number;
  total_stake: number;
  bet_type: BetSlipType;
  max_payout: number;
  free_bet_amount: number;
  bog_applicable: boolean;
}

export interface ResultBet {
  return_stake: number;
  win_profit: number;
  place_profit: number;
  profit: number;
  bog_amount_won: number;
  bog_odd: number;
  win_odd: number;
  place_odd: number;
}
