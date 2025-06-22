import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';

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
    });

    console.log('Patent', result);
    const doubles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.DOUBLE);
    const trebles = result.combinations.filter((combination) => combination.bet_type === BetSlipType.TREBLE);
    const doubles_payout = doubles.reduce((acc, curr) => acc + curr.payout, 0);
    const trebles_payout = trebles.reduce((acc, curr) => acc + curr.payout, 0);
    const singles_payout = result.singles.reduce((acc, curr) => acc + curr.payout, 0);

    console.log('Doubles payout', doubles_payout);
    console.log('Trebles payout', trebles_payout);
    console.log('Singles payout', singles_payout);
    console.log('Accumulator payout', result.accumulator_profit);

    expect(result.singles.length).toEqual(4);
    expect(trebles.length).toEqual(4);
    expect(doubles.length).toEqual(6);
    expect(doubles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(52.21, 2);
    expect(trebles.reduce((acc, curr) => acc + curr.payout, 0)).toBeCloseTo(45.75, 2);
    expect(result.accumulator_profit).toBeCloseTo(15, 2);

    expect(result.return_payout.toFixed(2)).toEqual('112.96');
    expect(result.return_stake.toFixed(2)).toEqual('55.00');
  });
});
