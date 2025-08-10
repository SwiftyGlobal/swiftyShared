import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';

describe('Patent Simple Winner Case', () => {
  const betCalculator = new BetCalculator();

  it('Patent Win Case', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/4',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/2',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '1/3',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
    ];
    const selections = [
      {
        selection_id: 1,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 35,
      bets,
      selections,
      bet_type: BetSlipType.PATENT,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
    });

    console.log('Patent', result);

    expect(result.return_payout.toFixed(2)).toEqual('60.63');
    expect(result.return_stake.toFixed(2)).toEqual('35.00');
  });

  it('Patent Win 2 Wins 1 Lose', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/4',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/2',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '1/3',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
    ];
    const selections = [
      {
        selection_id: 1,
        position: 1,
        result: BetResultType.LOSER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 35,
      bets,
      selections,
      bet_type: BetSlipType.PATENT,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
    });

    console.log('Patent', result);

    expect(result.return_payout.toFixed(2)).toEqual('23.13');
    expect(result.return_stake.toFixed(2)).toEqual('15.00');
  });

  it.only('Patent Win 1 Win 2 Lose 1 Lose', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/4',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/2',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '1/3',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
    ];
    const selections = [
      {
        selection_id: 1,
        position: 1,
        result: BetResultType.LOSER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 35,
      bets,
      selections,
      bet_type: BetSlipType.PATENT,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
    });

    console.log('Patent', result);

    expect(result.return_payout.toFixed(2)).toEqual('6.25');
    expect(result.return_stake.toFixed(2)).toEqual('5.00');
  });
});
