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

  it('Partial Win - Win Only', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: '1/2',
        odd_fractional: '1/4',
        ew_terms: '1/4',
        partial_win_percent: 50,
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
        result: BetResultType.PARTIAL,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 5,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 5,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(3.13, 1);
    expect(result.return_stake).toBeCloseTo(2.5);
    expect(result.calc.win_profit).toBeCloseTo(0.63, 1);
    expect(result.calc.place_profit).toBeCloseTo(0);
    expect(result.calc.stake).toBeCloseTo(2.5);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  it('Partial Win - Each Way', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 50,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 1.25,
      },
    ];

    const selections = [
      {
        selection_id: 1,
        position: 1,
        result: BetResultType.PARTIAL,
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

    expect(result.return_payout).toBeCloseTo(8.44, 1);
    expect(result.return_stake).toBeCloseTo(7.5);
    expect(result.calc.win_profit).toBeCloseTo(0.63, 1);
    expect(result.calc.place_profit).toBeCloseTo(0.31, 1);
    expect(result.calc.stake).toBeCloseTo(7.5);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });
});

describe('Edge Cases for BetCalculator Single', () => {
  const betCalculator = new BetCalculator();

  it('Zero odds for winner should return payout 0', () => {
    const bets = [
      {
        bet_id: 201,
        stake: 100,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
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
        selection_id: 201,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 100,
      total_stake: 100,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(0);
    expect(result.calc.win_profit).toBe(0);
  });

  it('Zero stake should return payout 0', () => {
    const bets = [
      {
        bet_id: 202,
        stake: 0,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 2.0,
        odd_decimal: 2.0,
      },
    ];
    const selections = [
      {
        selection_id: 202,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 0,
      total_stake: 0,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(0);
    expect(result.calc.win_profit).toBe(0);
  });

  it('Negative stake should return payout 0 or error', () => {
    const bets = [
      {
        bet_id: 203,
        stake: -50,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 2.0,
        odd_decimal: 2.0,
      },
    ];
    const selections = [
      {
        selection_id: 203,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: -50,
      total_stake: -50,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    // Prano edhe 0, edhe error në output.
    expect(result.return_payout).toBeLessThanOrEqual(0);
  });

  it('Negative odds should return payout 0 or error', () => {
    const bets = [
      {
        bet_id: 204,
        stake: 100,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: -1,
        odd_decimal: -3,
      },
    ];
    const selections = [
      {
        selection_id: 204,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 100,
      total_stake: 100,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeLessThanOrEqual(0);
  });

  it('Input with empty bets should be neutral (output 0)', () => {
    const result = betCalculator.processBet({
      stake: 99,
      total_stake: 99,
      bets: [],
      selections: [
        {
          selection_id: 301,
          position: 1,
          result: BetResultType.WINNER,
          dead_heat_count: null,
          partial_percent: null,
          each_way_places: null,
          each_way_terms: null,
        },
      ],
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(0);
  });

  it('Missing odd_fractional/decimal should not return payout > 0', () => {
    const bets = [
      {
        bet_id: 303,
        stake: 120,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: null,
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 0,
      },
    ];
    const result = betCalculator.processBet({
      stake: 120,
      total_stake: 120,
      bets,
      selections: [],
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(0);
  });

  it('Contradictory flags: is_each_way true, but each_way in BetSettings is false', () => {
    const bets = [
      {
        bet_id: 304,
        stake: 10,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '1/2',
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
        selection_id: 304,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0); // thjesht pranohet, nuk duhet crash
  });

  it('Extremes: very large stake and very large odds', () => {
    const bets = [
      {
        bet_id: 305,
        stake: 1e10,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 1e9,
        odd_decimal: 1e9,
      },
    ];
    const selections = [
      {
        selection_id: 305,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 1e10,
      total_stake: 1e10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 1e11,
      max_payout: 1e20,
      each_way: false,
    });
    expect(result.return_payout).toBeLessThanOrEqual(1e20);
  });

  it('partial_win_percent = 0, 100, negative, >100', () => {
    // 0%
    const bets = [
      {
        bet_id: 401,
        stake: 100,
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 5,
        odd_decimal: 5,
      },
    ];
    const selections = [
      {
        selection_id: 401,
        position: 1,
        result: BetResultType.PARTIAL,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    let result = betCalculator.processBet({
      stake: 100,
      total_stake: 100,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);

    // 100%
    bets[0].partial_win_percent = 100;
    result = betCalculator.processBet({
      stake: 100,
      total_stake: 100,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);

    // Negative partial
    bets[0].partial_win_percent = -20;
    result = betCalculator.processBet({
      stake: 100,
      total_stake: 100,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);

    // >100
    bets[0].partial_win_percent = 120;
    result = betCalculator.processBet({
      stake: 100,
      total_stake: 100,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
  });

  it('stake=1 odd_decimal=2 (minimum output = stake)', () => {
    const bets = [
      {
        bet_id: 500,
        stake: 1,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 2,
        odd_decimal: 2,
      },
    ];
    const selections = [
      {
        selection_id: 500,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 1,
      total_stake: 1,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    console.log({ result });
    expect(result.return_payout).toBeCloseTo(2, 2);
  });

  it('bog_applicable true with negative bog_max_payout', () => {
    const bets = [
      {
        bet_id: 600,
        stake: 10,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 5,
        odd_decimal: 5,
      },
    ];
    const selections = [
      {
        selection_id: 600,
        position: 1,
        result: BetResultType.WINNER,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: -100,
      max_payout: 1000,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
  });

  it('Single: BOG with SP odds higher than main odds → expect result_type WINNER with BOG benefit', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 10,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 4,
        odd_decimal: 3,
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
      stake: 10,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 100,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeCloseTo(40, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.bog_amount_won).toBeCloseTo(10, 1);
  });
});

describe('Single Half-Won / Half-Lost', () => {
  const betCalculator = new BetCalculator();

  it('Half Won - Win Only', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1001,
        stake: 10,
        result: BetResultType.HALF_WON,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.0,
      },
    ];

    const selections = [
      {
        selection_id: 1001,
        position: 1,
        result: BetResultType.HALF_WON,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    // Half stake wins at 2.0 → profit = 5; full stake returned
    expect(result.return_stake).toBeCloseTo(10);
    expect(result.calc.win_profit).toBeCloseTo(5, 3);
    expect(result.calc.place_profit).toBeCloseTo(0, 3);
    expect(result.return_payout).toBeCloseTo(15, 3);
    expect(result.result_type).toBe(BetResultType.HALF_WON);
  });

  it('Half Lost - Win Only', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1002,
        stake: 10,
        result: BetResultType.HALF_LOST,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.0,
      },
    ];

    const selections = [
      {
        selection_id: 1002,
        position: 1,
        result: BetResultType.HALF_LOST,
        dead_heat_count: null,
        partial_percent: null,
        each_way_places: null,
        each_way_terms: null,
      },
    ];

    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections,
      bet_type: BetSlipType.SINGLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    // Half stake returned, no profit
    expect(result.return_stake).toBeCloseTo(5, 3);
    expect(result.calc.win_profit).toBeCloseTo(0, 3);
    expect(result.calc.place_profit).toBeCloseTo(0, 3);
    expect(result.return_payout).toBeCloseTo(5, 3);
    expect(result.result_type).toBe(BetResultType.HALF_LOST);
  });

  it('Half Won - Each Way', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1003,
        stake: 5,
        result: BetResultType.HALF_WON,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/2',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.0,
      },
    ];

    const selections = [
      {
        selection_id: 1003,
        position: 1,
        result: BetResultType.HALF_WON,
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
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    // Win half stake at 2.0 → 2.5 profit; place half stake at EW 1/2 of (2-1) → place decimal 1.5 → profit 1.25
    expect(result.return_stake).toBeCloseTo(10, 3);
    expect(result.calc.win_profit).toBeCloseTo(2.5, 2);
    expect(result.calc.place_profit).toBeCloseTo(1.25, 2);
    expect(result.return_payout).toBeCloseTo(13.75, 2);
    expect(result.result_type).toBe(BetResultType.HALF_WON);
  });

  it('Half Lost - Each Way', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1004,
        stake: 5,
        result: BetResultType.HALF_LOST,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/2',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.0,
      },
    ];

    const selections = [
      {
        selection_id: 1004,
        position: 1,
        result: BetResultType.HALF_LOST,
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
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    // Half of each leg returned; no profit
    expect(result.return_stake).toBeCloseTo(5, 3);
    expect(result.calc.win_profit).toBeCloseTo(0, 3);
    expect(result.calc.place_profit).toBeCloseTo(0, 3);
    expect(result.return_payout).toBeCloseTo(5, 3);
    expect(result.result_type).toBe(BetResultType.HALF_LOST);
  });
});
