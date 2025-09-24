import { BetResultType } from '../../common/constants/betResultType';
import { BetSlipType } from '../../common/constants/betSlipType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';
import { BetCalculator } from '../../BetCalculator/bet-calculator.class';

describe('Single without each way ', () => {
  const betCalculator = new BetCalculator();

  it('Simple Win Case', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 200,
        result: BetResultType.WINNER,
        is_starting_price: true,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 1.61,
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
      stake: 200,
      total_stake: 200,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(322, 1);
    expect(result.return_stake).toBeCloseTo(200);
    expect(result.calc.win_profit).toBeCloseTo(122.0);
    expect(result.calc.place_profit).toBeCloseTo(0);
    expect(result.calc.bog_amount_won).toBeCloseTo(0);
    expect(result.calc.bog_odd).toBeCloseTo(0);
    expect(result.calc.stake).toBeCloseTo(200);
    expect(result.calc.max_payout).toBeCloseTo(0);
    expect(result.calc.max_bog_payout).toBeCloseTo(0);
    expect(result.calc.free_bet_amount).toBeCloseTo(0);
  });

  it('Winner with Max Payout - max payout 25', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 20,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 1.5,
        odd_decimal: 1.25,
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
      stake: 20,
      total_stake: 20,
      max_payout: 25,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toEqual(25);
    expect(result.return_stake).toEqual(20);
    expect(result.calc.win_profit).toEqual(5);
    expect(result.calc.place_profit).toEqual(0);
    expect(result.bog_amount_won).toEqual(5);
    expect(result.calc.bog_odd).toEqual(0.5);
    expect(result.calc.stake).toEqual(20);
  });

  it('Winner with Max BOG Payout  5', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 20,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 6.0,
        odd_decimal: 4.0,
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
      stake: 20,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 10,
      max_payout: 0,
      each_way: false,
    });

    console.log({ result });

    expect(result.return_payout).toEqual(90);
    expect(result.return_stake).toEqual(20);
    expect(result.calc.win_profit).toEqual(60);
    expect(result.calc.place_profit).toEqual(0);
    expect(result.bog_amount_won).toEqual(10);
    // expect(result.calc.bog_odd).toEqual(5);
    expect(result.calc.stake).toEqual(20);
  });

  it('Loser', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 20,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
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
      stake: 20,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 5,
      max_payout: 0,
      each_way: false,
    });

    console.log({ result });

    expect(result.return_payout).toEqual(0);
    expect(result.return_stake).toEqual(0);
    expect(result.calc.win_profit).toEqual(0);
    expect(result.calc.place_profit).toEqual(0);
    expect(result.calc.bog_amount_won).toEqual(0);
    expect(result.calc.bog_odd).toEqual(0);
    expect(result.calc.stake).toEqual(0);
  });

  it('Void', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 20,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
        ew_terms: '1/4',
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
        result: BetResultType.VOID,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 20,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 5,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toEqual(20);
    expect(result.return_stake).toEqual(20);
    expect(result.calc.win_profit).toEqual(0);
    expect(result.calc.place_profit).toEqual(0);
    expect(result.calc.stake).toEqual(20);
  });

  it('Each Way - Winner', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
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
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 5,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(11.56, 1);
    expect(result.return_stake).toEqual(10);
    expect(result.calc.win_profit).toBeCloseTo(1.25, 1);
    expect(result.calc.place_profit).toBeCloseTo(0.31, 1);
    expect(result.calc.stake).toEqual(10);
  });

  it('Each Way - Placed', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 20,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
        result: BetResultType.PLACED,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 5,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(5.31, 1);
    expect(result.return_stake).toBeCloseTo(5);
    expect(result.calc.win_profit).toBeCloseTo(0);
    expect(result.calc.place_profit).toBeCloseTo(0.31, 1);
    expect(result.calc.stake).toEqual(5);
  });

  it('Each Way - Void', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
        result: BetResultType.VOID,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 5,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(10);
    expect(result.return_stake).toBeCloseTo(10);
    expect(result.calc.win_profit).toBeCloseTo(0);
    expect(result.calc.place_profit).toBeCloseTo(0);
    expect(result.calc.stake).toBeCloseTo(10);
  });
});
