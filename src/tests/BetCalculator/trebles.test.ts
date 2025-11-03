import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';

// Edge cases dhe përshkrime të qarta për TREBLES
describe('TREBLES - Edge cases dhe pritje determinuese', () => {
  const betCalculator = new BetCalculator();

  // WINNER + WINNER + WINNER → WINNER
  it('TREBLES: WINNER×3 → expect result_type WINNER', () => {
    const bets = [1, 2, 3].map((id) => ({
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
      odd_decimal: 2 + id * 0.1,
    }));

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 5,
      bets,
      selections: [],
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(53.13, 1);
  });

  // WINNER + WINNER + LOSER → LOSER
  it('TREBLES: WINNER×2 + LOSER → expect result_type LOSER', () => {
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
        odd_decimal: 2.5,
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
        odd_decimal: 2.1,
      },
      {
        bet_id: 3,
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
        odd_decimal: 3,
      },
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 5,
      bets,
      selections: [],
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.LOSER);
    expect(result.return_payout).toBeCloseTo(0, 1);
  });

  // EW: PLACED + PLACED + WINNER → WINNER
  it('TREBLES (EW): PLACED×2 + WINNER → expect result_type WINNER', () => {
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
    ];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 15,
      bets,
      selections: [],
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(13.54, 1);
  });

  // max_payout cap
  it('TREBLES: max_payout cap → payout capped, result_type WINNER', () => {
    const bets = [
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
        sp_odd_decimal: 0,
        odd_decimal: 6,
      },
      {
        bet_id: 2,
        stake: 10,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 5,
      },
      {
        bet_id: 3,
        stake: 10,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4,
      },
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 150,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(150, 1);
  });
});

describe('Trebles Simple Winner Case', () => {
  const betCalculator = new BetCalculator();

  it('Treble Win Case', () => {
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
      total_stake: 5,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(12.5, 1);
  });

  it('Treble Win Case - Partial Win', () => {
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
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '1/3',
        ew_terms: '',
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
        result: BetResultType.WINNER,
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
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toEqual(6.25);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  it('Treble Win Case - Void', () => {
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
        result: BetResultType.VOID,
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
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '1/3',
        ew_terms: '',
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
        result: BetResultType.WINNER,
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
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toEqual(4.17);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  it('Treble Win Case - 4 selections', () => {
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
        sp_odd_fractional: '',
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
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout.toFixed(2)).toEqual('45.75');
  });

  it('Treble Win Case - 4 selections - 1 Void', () => {
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
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: '',
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
        sp_odd_fractional: '',
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
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_max_payout: 0,
      max_payout: 0,
      bog_applicable: false,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(37.13, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  it('Treble Win Case - 4 selections - 1 Loser', () => {
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
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
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
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout.toFixed(2)).toEqual('11.25');
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  it('Treble Win Case - 4 selections - 2 Loser', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
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
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
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
        odd_decimal: 2.25,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
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
        odd_decimal: 3,
      },
    ];
    const selections = [];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout.toFixed(2)).toEqual('0.00');
    expect(result.result_type).toBe(BetResultType.LOSER);
  });

  it('Treble Win Case - 4 selections - 1 Loser - 1 Void', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
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
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
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
        odd_decimal: 2.25,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
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
        odd_decimal: 3,
      },
    ];
    const selections = [];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout.toFixed(2)).toEqual('22.50');
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  it('Treble Win Case - EW- 4 selections - 1 Loser - 1 Void', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.25,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 3,
      },
    ];
    const selections = [];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout.toFixed(2)).toEqual('30.70');
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  it('Treble Win Case - EW- 4 selections - 1 Loser - 1 Void', () => {
    const bets = [
      {
        bet_id: 1,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.25,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 3,
      },
    ];
    const selections = [];

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 20,
      bets,
      selections,
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout.toFixed(2)).toEqual('8.20');
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  it('TREBLES: BOG with SP odds higher than main odds (WINNER×3) → expect result_type WINNER with BOG benefit', () => {
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
        sp_odd_decimal: 4,
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
        sp_odd_decimal: 3,
        odd_decimal: 2,
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
        sp_odd_decimal: 2.5,
        odd_decimal: 2,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 5,
      bets,
      selections: [],
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 50,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(110, 1);
    expect(result.bog_amount_won).toBeCloseTo(50, 1);
  });
});
