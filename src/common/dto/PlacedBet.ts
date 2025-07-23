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

export interface ResultSingle {
  stake: number;
  win_profit: number;
  place_profit: number;
  profit: number;
  bog_amount_won: number;
  bog_odd: number;
  win_odd: number;
  place_odd: number;
  payout: number;
  result_type: BetResultType;
}

export interface ResultCombination {
  stake: number;
  payout: number;
  win_profit: number;
  place_profit: number;
  profit: number;
  bog_amount_won: number;
  bog_odd: number;
  win_odd: number;
  place_odd: number;
  result_type: BetResultType;
  bet_type: BetSlipType;
  adjusted_bet_type?: BetSlipType;
}

export interface ResultMainBet {
  stake: number;
  payout: number;
  win_profit: number;
  place_profit: number;
  result_type: BetResultType;
  singles: ResultSingle[];
  combinations: ResultCombination[];
  accumulator_profit: number;
}

export interface BetResult {
  calc: {
    win_profit: number;
    place_profit: number;
    bog_amount_won: number;
    max_payout: number;
    max_bog_payout: number;
    free_bet_amount: number;
    stake: number;
    bog_odd: number;
    profit: number;
  };
  singles: ResultSingle[];
  combinations: ResultCombination[];
  return_payout: number;
  return_stake: number;
  result_type: BetResultType;
  bog_amount_won: number;
  accumulator_profit: number;
}
