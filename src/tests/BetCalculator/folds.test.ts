import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';

describe('FOLD-4 - Core scenarios (deterministic expectations)', () => {
  const betCalculator = new BetCalculator();

  // 4-fold: all WINNER → expect WINNER
  it('FOLD-4: WINNER×4 → expect result_type WINNER', () => {
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
        odd_decimal: 8,
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
        odd_decimal: 2.9,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 1.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 1.75,
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
      stake: 4,
      total_stake: 4,
      bets,
      selections,
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    console.log('Folds Win Case', JSON.stringify(result));

    // 243.60
    expect(result.return_payout).toBeCloseTo(243.6, 1);
    expect(result.return_stake).toBeCloseTo(4, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // 4-fold: three WINNER + one PARTIAL → expect WINNER (payout > 0)
  it('FOLD-4: WINNER×3 + PARTIAL → expect result_type WINNER', () => {
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
        odd_decimal: 8,
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
        odd_decimal: 2.9,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 1.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 50,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 1.75,
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
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    console.log('Folds Win Case', JSON.stringify(result));

    // 243.60
    expect(result.return_payout).toBeCloseTo(152.25, 1);
    expect(result.return_stake).toBeCloseTo(2.5, 1);
    expect(result.result_type).toEqual(BetResultType.WINNER);
  });

  // 4-fold: three WINNER + one VOID → expect WINNER (VOID ignored, payout > 0)
  it('FOLD-4: WINNER×3 + VOID → expect result_type WINNER', () => {
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
        odd_decimal: 8,
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
        odd_decimal: 2.9,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 1.5,
      },
      {
        bet_id: 4,
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
        odd_decimal: 1.75,
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
      stake: 4,
      total_stake: 4,
      bets,
      selections,
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    console.log('Folds Win Case', JSON.stringify(result));

    // 243.60
    expect(result.return_payout).toBeCloseTo(139.2, 1);
    expect(result.return_stake).toBeCloseTo(4, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // 4-fold: three WINNER + one LOSER → expect LOSER (all legs required in 4-fold)
  it('FOLD-4: WINNER×3 + LOSER → expect result_type LOSER', () => {
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
        result: BetResultType.LOSER,
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
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    console.log('Folds Loser Case', JSON.stringify(result));

    // expect(result.singles.length).toEqual(4);
    expect(result.result_type).toEqual(BetResultType.LOSER);
    expect(result.return_payout).toBeCloseTo(0, 1);
    expect(result.return_stake).toBeCloseTo(0.0, 1);
  });

  // 4-fold EW: mixed results across 7 selections, fold_type=4 → expect WINNER (payout > 0)
  it('FOLD-4 (EW): mixed WINNER/LOSER/PLACED → expect result_type WINNER', () => {
    const bets = [
      {
        bet_id: 1,
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
        odd_decimal: 3,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 3,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4.5,
      },
      {
        bet_id: 5,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 3,
      },
      {
        bet_id: 6,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4.5,
      },
      {
        bet_id: 7,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4,
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
      total_stake: 350,
      bets,
      selections,
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    console.log('Folds Win Case', JSON.stringify(result));

    // 243.60
    expect(result.return_payout.toFixed(2)).toEqual('34.68');
    expect(result.return_stake.toFixed(2)).toEqual('5.00');
    expect(result.result_type).toEqual(BetResultType.WINNER);
  });

  // 4-fold EW: three WINNER + one PLACED → expect WINNER (EW place contributes, payout > 0)
  it('FOLD-4 (EW): WINNER×3 + PLACED → expect result_type WINNER', () => {
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
        odd_decimal: 3,
      },
      {
        bet_id: 2,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
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
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4.5,
      },
      {
        bet_id: 4,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.PLACED,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '1/5',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 4,
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
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    console.log('Folds Win Case', JSON.stringify(result));

    // 243.60
    expect(result.return_payout).toBeCloseTo(34.68, 1);
    expect(result.return_stake).toBeCloseTo(5, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  it('FOLD-4: BOG with SP odds higher than main odds (WINNER×4) → expect result_type WINNER with BOG benefit', () => {
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
        sp_odd_decimal: 4,
        odd_decimal: 3,
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
        sp_odd_decimal: 3,
        odd_decimal: 2,
      },
      {
        bet_id: 3,
        bet_type: BetSlipType.SINGLE,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: null,
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 2.5,
        odd_decimal: 2,
      },
      {
        bet_id: 4,
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
        sp_odd_decimal: 2.2,
        odd_decimal: 2,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 5,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 4,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 100,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeGreaterThan(0);
    expect(result.bog_amount_won).toBeGreaterThan(0);
  });
});

describe('FOLD-5 - Core and edge scenarios', () => {
  const betCalculator = new BetCalculator();

  // 5-fold: all WINNER → WINNER
  it('FOLD-5: WINNER×5 → expect result_type WINNER', () => {
    const bets = [1, 2, 3, 4, 5].map((id) => ({
      bet_id: id,
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
      odd_decimal: 2.0 + id * 0.1,
    }));

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 25,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 5,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(318.78, 1);
  });

  // 5-fold: four WINNER + one VOID → WINNER
  it('FOLD-5: WINNER×4 + VOID → expect result_type WINNER', () => {
    const bets = [1, 2, 3, 4].map((id) => ({
      bet_id: id,
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
      odd_decimal: 2.0 + id * 0.1,
    }));
    bets.push({
      bet_id: 5,
      bet_type: BetSlipType.SINGLE,
      stake: 5,
      result: BetResultType.VOID,
      is_starting_price: false,
      sp_odd_fractional: '',
      odd_fractional: '',
      ew_terms: '',
      partial_win_percent: 0,
      rule_4: 0,
      is_each_way: false,
      sp_odd_decimal: 0,
      odd_decimal: 2.2,
    });

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 25,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 5,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(127.51, 1);
  });

  // 5-fold: four WINNER + one LOSER → LOSER
  it('FOLD-5: WINNER×4 + LOSER → expect result_type LOSER', () => {
    const bets = [1, 2, 3, 4].map((id) => ({
      bet_id: id,
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
      odd_decimal: 2.0 + id * 0.1,
    }));
    bets.push({
      bet_id: 5,
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
      odd_decimal: 2.2,
    });

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 25,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 5,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.LOSER);
    expect(result.return_payout).toBeCloseTo(0, 1);
  });

  // 5-fold (EW): PLACED×5 → PLACED
  it('FOLD-5 (EW): PLACED×5 → expect result_type PLACED', () => {
    const bets = [1, 2, 3, 4, 5].map((id) => ({
      bet_id: id,
      bet_type: BetSlipType.SINGLE,
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
    }));

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 25,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 5,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.result_type).toBe(BetResultType.PLACED);
    expect(result.return_payout).toBeCloseTo(24.57, 1);
  });

  it('FOLD-5: BOG with SP odds higher than main odds (WINNER×5) → expect result_type WINNER with BOG benefit', () => {
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
        sp_odd_decimal: 4,
        odd_decimal: 3,
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
        sp_odd_decimal: 3.5,
        odd_decimal: 2.5,
      },
      {
        bet_id: 3,
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
        sp_odd_decimal: 3,
        odd_decimal: 2,
      },
      {
        bet_id: 4,
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
        sp_odd_decimal: 2.5,
        odd_decimal: 2,
      },
      {
        bet_id: 5,
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
        sp_odd_decimal: 2.2,
        odd_decimal: 2,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 25,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 5,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 100,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeGreaterThan(0);
    expect(result.bog_amount_won).toBeGreaterThan(0);
  });
});

describe('FOLD-6 - Core and edge scenarios', () => {
  const betCalculator = new BetCalculator();

  // 6-fold: all WINNER → WINNER
  it('FOLD-6: WINNER×6 → expect result_type WINNER', () => {
    const bets = [1, 2, 3, 4, 5, 6].map((id) => ({
      bet_id: id,
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
      odd_decimal: 2.0 + id * 0.1,
    }));

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 30,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 6,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(828.83, 1);
  });

  // 6-fold: five WINNER + one LOSER → LOSER
  it('FOLD-6: WINNER×5 + LOSER → expect result_type LOSER', () => {
    const bets = [1, 2, 3, 4, 5].map((id) => ({
      bet_id: id,
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
      odd_decimal: 2.0 + id * 0.1,
    }));
    bets.push({
      bet_id: 6,
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
      odd_decimal: 2.5,
    });

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 30,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 6,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.result_type).toBe(BetResultType.LOSER);
    expect(result.return_payout).toBeCloseTo(0, 1);
  });

  // 6-fold (EW): PLACED×6 → PLACED
  it('FOLD-6 (EW): PLACED×6 → expect result_type PLACED', () => {
    const bets = [1, 2, 3, 4, 5, 6].map((id) => ({
      bet_id: id,
      bet_type: BetSlipType.SINGLE,
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
    }));

    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 30,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 6,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    console.log('Folds Placed Case', JSON.stringify(result));

    expect(result.result_type).toBe(BetResultType.PLACED);
    expect(result.return_payout).toBeCloseTo(33.79, 1);
  });

  it('FOLD-6: BOG with SP odds higher than main odds (WINNER×6) → expect result_type WINNER with BOG benefit', () => {
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
        sp_odd_decimal: 4,
        odd_decimal: 3,
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
        sp_odd_decimal: 3.5,
        odd_decimal: 2.5,
      },
      {
        bet_id: 3,
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
        sp_odd_decimal: 3,
        odd_decimal: 2,
      },
      {
        bet_id: 4,
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
        sp_odd_decimal: 2.5,
        odd_decimal: 2,
      },
      {
        bet_id: 5,
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
        sp_odd_decimal: 2.2,
        odd_decimal: 2,
      },
      {
        bet_id: 6,
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
        sp_odd_decimal: 2.1,
        odd_decimal: 2,
      },
    ];
    const result = betCalculator.processBet({
      stake: 5,
      total_stake: 30,
      bets,
      selections: [],
      bet_type: BetSlipType.FOLD,
      fold_type: 6,
      free_bet_amount: 0,
      bog_applicable: true,
      bog_max_payout: 100,
      max_payout: 0,
      each_way: false,
    });
    expect(result.result_type).toBe(BetResultType.WINNER);
    expect(result.return_payout).toBeCloseTo(700.0, 1);
    expect(result.bog_amount_won).toBeCloseTo(100, 1);
  });
});
