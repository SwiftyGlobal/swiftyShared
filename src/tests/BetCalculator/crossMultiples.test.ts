import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';

const leg = (id: number, event_id: string): PlacedBetSelection => ({
  bet_id: id, stake: 1, result: BetResultType.WINNER,
  is_starting_price: false, sp_odd_fractional: '', odd_fractional: '1/1',
  ew_terms: '', partial_win_percent: 0, rule_4: 0, is_each_way: false,
  sp_odd_decimal: 0, odd_decimal: 2, event_id,
});

describe('CROSS_DOUBLE settlement', () => {
  const bc = new BetCalculator();
  it('excludes same-event pair: A{A1,A2},B,C all winners @2.0 -> 5 winning doubles', () => {
    const bets = [leg(1, 'A'), leg(2, 'A'), leg(3, 'B'), leg(4, 'C')];
    const r = bc.processBet({
      stake: 1, total_stake: 5, bets, bet_type: BetSlipType.CROSS_DOUBLE,
      free_bet_amount: 0, bog_applicable: false, bog_max_payout: 0, max_payout: 0, each_way: false,
    });
    // 5 valid cross doubles (A1A2 excluded), each (2*2) payout on stake 1 -> profit checked via combinations count
    expect(r.combinations.length).toBe(5);
  });
});
