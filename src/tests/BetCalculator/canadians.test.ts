import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';

// Edge cases dhe përshkrime të qarta për CANADIAN (5 seleksione: 10 doubles, 10 trebles, 5 fourfolds, 1 accumulator)
describe('CANADIAN - Edge cases dhe pritje determinuese', () => {
  const betCalculator = new BetCalculator();

  it('CANADIAN: WINNER×5 → expect result_type WINNER', () => {
    const bets = [1, 2, 3, 4, 5].map((id) => ({
      bet_id: id,
      stake: 5,
      result: BetResultType.WINNER,
      is_starting_price: false,
      sp_odd_fractional: '',
      odd_fractional: '',
      ew_terms: '',
      partial_win_percent: 0,
      rule_4: 0,
      is_each_way: false,
      sp_odd_decimal: 0,
      odd_decimal: 2 + id * 0.2,
    }));

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 155,
      bets,
      selections: [],
      bet_type: BetSlipType.CANADIAN,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(2906.77, 1);
  });

  it('CANADIAN: WINNER×4 + LOSER → expect result_type Winner', () => {
    const bets = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 3,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.5,
      },
      {
        bet_id: 3,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.1,
      },
      {
        bet_id: 4,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.8,
      },
      {
        bet_id: 5,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.4,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 155,
      bets,
      selections: [],
      bet_type: BetSlipType.CANADIAN,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(767.6, 1);
  });

  it('CANADIAN (EW): PLACED×3 + WINNER×2 → expect result_type WINNER', () => {
    const bets = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.5,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.25,
      },
      {
        bet_id: 3,
        stake: 5,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.1,
      },
      {
        bet_id: 4,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 3,
      },
      {
        bet_id: 5,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.8,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 310,
      bets,
      selections: [],
      bet_type: BetSlipType.CANADIAN,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(385.09, 1);
  });
});

describe('Canadian Simple Winner Case', () => {
  const betCalculator = new BetCalculator();

  it('Canadian Win Case', () => {
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
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '1/5',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
      {
        bet_id: 5,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '4/5',
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
      bet_type: BetSlipType.CANADIAN,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    console.log('Canadian', JSON.stringify(result));
    const doubles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.DOUBLE);
    const trebles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.TREBLE);
    const folds = result.combinations.filter((combination) => combination.bet_type === BetSlipType.FOLD);

    expect(result.singles.length).toEqual(5);
    expect(doubles.length).toEqual(10);
    expect(trebles.length).toEqual(10);
    expect(folds.length).toEqual(5);
    expect(doubles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(99.75, 1);
    expect(trebles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(139.725, 1);
    expect(folds.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(97.35, 1);
    expect(result.accumulator_profit).toBeCloseTo(27, 2);

    expect(result.return_payout).toBeCloseTo(363.82, 1);
  });

  it('Canadian 3 losers 2 voids', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 0.3,
        result: BetResultType.LOSER,
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
        stake: 0.3,
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
        stake: 0.3,
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
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 0.3,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 9,
      },
      {
        bet_id: 5,
        bet_type: BetSlipType.SINGLE,
        stake: 0.3,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4.2,
      },
    ];
    const selections = [];

    const result = betCalculator.processBet({
      stake: 0.3,
      total_stake: 0.3,
      bets,
      selections,
      bet_type: BetSlipType.CANADIAN,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    console.log('Canadian', JSON.stringify(result));

    expect(result.return_payout).toBeCloseTo(0.3, 1);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });
});
