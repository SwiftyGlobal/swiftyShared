import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';

// Edge cases dhe përshkrime të qarta për YANKEE (4 seleksione: 6 doubles, 4 trebles, 1 accumulator)
describe('YANKEE - Edge cases dhe pritje determinuese', () => {
  const betCalculator = new BetCalculator();

  it('YANKEE: WINNER×4 → expect result_type WINNER', () => {
    const bets = [1, 2, 3, 4].map((id) => ({
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
      total_stake: 44,
      bets,
      selections: [],
      bet_type: BetSlipType.YANKEE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(689.19, 1);
  });

  it('YANKEE: WINNER×3 + LOSER → expect result_type WINNER', () => {
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
        result: BetResultType.LOSER,
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
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 44,
      bets,
      selections: [],
      bet_type: BetSlipType.YANKEE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(174.0, 1);
  });

  it('YANKEE (EW): PLACED×2 + WINNER×2 → expect result_type WINNER', () => {
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
        odd_decimal: 2.8,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 88,
      bets,
      selections: [],
      bet_type: BetSlipType.YANKEE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(177.01, 1);
  });
});

describe('Yankee Simple Winner Case', () => {
  const betCalculator = new BetCalculator();

  it('Yankee Win Case', () => {
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
      bet_type: BetSlipType.YANKEE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    console.log('Patent', JSON.stringify(result));
    const doubles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.DOUBLE);
    const trebles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.TREBLE);

    expect(result.singles.length).toEqual(4);
    expect(trebles.length).toEqual(4);
    expect(doubles.length).toEqual(6);
    expect(doubles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(52.21, 2);
    expect(trebles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(45.75, 2);
    expect(result.accumulator_profit).toBeCloseTo(15, 2);

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(112.96, 1);
    expect(result.return_stake.toFixed(2)).toEqual('55.00');
  });

  it('Yankee Each Way Case', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.63,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 4.5,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.2,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.2,
      },
    ];
    const selections = [];

    const result = betCalculator.processBet({
      stake: 1,
      total_stake: 35,
      bets,
      selections,
      bet_type: BetSlipType.YANKEE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    console.log('Patent', JSON.stringify(result));
    const doubles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.DOUBLE);
    const trebles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.TREBLE);

    expect(result.singles.length).toEqual(4);
    expect(trebles.length).toEqual(4);
    expect(doubles.length).toEqual(6);
    expect(doubles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(59.86, 1);
    expect(trebles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(97.56, 1);
    expect(result.accumulator_profit).toBeCloseTo(61.09, 1);

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(218.51, 1);
    expect(result.return_stake).toBeCloseTo(22.0, 1);
  });
});
