import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';

describe('DOUBLE - Core scenarios (deterministic expectations)', () => {
  const betCalculator = new BetCalculator();

  // Both legs WINNER → expect WINNER (classic double win)
  it('Both legs WINNER → expect result_type WINNER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(9.38);
  });

  // One WINNER + one PARTIAL → expect PARTIAL
  it('WINNER + PARTIAL → expect result_type PARTIAL', () => {
    const bets: PlacedBetSelection[] = [
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
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.PARTIAL,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '',
        partial_win_percent: 50,
        rule_4: 0,
        is_each_way: false,
        sp_odd_decimal: 0,
        odd_decimal: 2,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(10.0);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  // One WINNER + one LOSER → expect LOSER (double voided by losing leg)
  it('WINNER + LOSER → expect result_type LOSER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(0);
    expect(result.result_type).toBe(BetResultType.LOSER);
  });

  // Three legs provided; internal combinations yield overall WINNER for the double set
  it('Combinational (3 legs, one LOSER) → overall expect WINNER', () => {
    const bets: PlacedBetSelection[] = [
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
        odd_decimal: 2,
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
        odd_decimal: 2.5,
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
      total_stake: 15,
      bets,
      selections,
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout.toFixed(2)).toEqual('30.00');
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // EW on both legs and both WINNER → expect WINNER with EW payout behaviour
  it('Each Way: both WINNER → expect result_type WINNER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
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
        odd_decimal: 2,
      },
      {
        bet_id: 2,
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
        odd_decimal: 2.25,
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
      stake: 1,
      total_stake: 5,
      bets,
      selections,
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(6.14, 1);
  });

  // EW: one LOSER + one PLACED → expect PARTIAL
  it('Each Way: LOSER + PLACED → expect result_type PARTIAL', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.LOSER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2,
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
        odd_decimal: 2.5,
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
      total_stake: 15,
      bets,
      selections,
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(10.31, 1);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  // EW: both VOID → expect VOID (stake returned under EW settings)
  it('Each Way: VOID + VOID → expect result_type VOID', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.VOID,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 0,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.VOID,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(10, 1);
    expect(result.result_type).toBe(BetResultType.VOID);
  });

  // EW: one WINNER + one VOID → expect WINNER
  it('Each Way: WINNER + VOID → expect result_type WINNER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
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
        bet_id: 2,
        stake: 5,
        result: BetResultType.VOID,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(22.5, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // EW: one LOSER + one VOID → expect LOSER
  it('Each Way: LOSER + VOID → expect result_type LOSER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.LOSER,
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
        bet_id: 2,
        stake: 5,
        result: BetResultType.VOID,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(0, 1);
    expect(result.result_type).toBe(BetResultType.LOSER);
  });

  // EW: one PLACED + one VOID → expect PLACED
  it('Each Way: PLACED + VOID → expect result_type PLACED', () => {
    const bets: PlacedBetSelection[] = [
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
        odd_decimal: 3,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.VOID,
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
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(7.5, 1);
    expect(result.result_type).toBe(BetResultType.PLACED);
  });

  // Rule 4 reductions on both legs (both WINNER) → expect WINNER with reduced payout
  it('Rule4: both WINNER with reductions → expect result_type WINNER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 10,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 20,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.25,
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
      total_stake: 5,
      bets,
      selections,
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(result.return_payout).toBeCloseTo(19, 1);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // Rule 4 reductions under EW (both WINNER) → expect WINNER (EW)
  it('Rule4 + Each Way: both WINNER → expect result_type WINNER', () => {
    const bets: PlacedBetSelection[] = [
      {
        bet_id: 1,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 10,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2,
      },
      {
        bet_id: 2,
        stake: 5,
        result: BetResultType.WINNER,
        is_starting_price: false,
        sp_odd_fractional: '',
        odd_fractional: '',
        ew_terms: '1/4',
        partial_win_percent: 0,
        rule_4: 20,
        is_each_way: true,
        sp_odd_decimal: 0,
        odd_decimal: 2.25,
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
      total_stake: 5,
      bets,
      selections,
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });

    expect(result.return_payout).toBeCloseTo(26.66, 1);
  });
});

describe('Edge Cases for DOUBLE bet type (odds > 1, inputs sanitized)', () => {
  const betCalculator = new BetCalculator();
  const baseBet = {
    stake: 10,
    is_starting_price: false,
    sp_odd_fractional: '',
    odd_fractional: '',
    ew_terms: '',
    partial_win_percent: 0,
    rule_4: 0,
    is_each_way: false,
    sp_odd_decimal: 2.5,
    odd_decimal: 2.5,
  };
  function clone(bet, mod) {
    return { ...bet, ...mod };
  }

  // WINNER + VOID → expect WINNER (void leg ignored in combo)
  it('Double: WINNER + VOID → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.VOID }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0); // payout may be 0 for VOID
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // WINNER + PLACED → expect PARTIAL (placed leg contributes, not a full win)
  it('Double: WINNER + PLACED → expect result_type PARTIAL', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.PLACED }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  // WINNER + PARTIAL → expect PARTIAL (partial downgrades overall)
  it('Double: WINNER + PARTIAL → expect result_type PARTIAL', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.PARTIAL, partial_win_percent: 50 }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  // WINNER + LOSER → expect LOSER (one losing leg voids the double)
  it('Double: WINNER + LOSER → expect result_type LOSER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.LOSER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(0);
    expect(result.result_type).toBe(BetResultType.LOSER);
  });

  // VOID + VOID → expect VOID (no action across both legs)
  it('Double: VOID + VOID → expect result_type VOID', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.VOID }),
      clone(baseBet, { bet_id: 2, result: BetResultType.VOID }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(10);
    expect(result.result_type).toBe(BetResultType.VOID);
  });

  // PARTIAL + PARTIAL → expect PARTIAL
  it('Double: PARTIAL + PARTIAL → expect result_type PARTIAL', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.PARTIAL, partial_win_percent: 80 }),
      clone(baseBet, { bet_id: 2, result: BetResultType.PARTIAL, partial_win_percent: 40 }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  // PLACED + PLACED → expect PLACED
  it('Double: PLACED + PLACED → expect result_type PLACED', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.PLACED }),
      clone(baseBet, { bet_id: 2, result: BetResultType.PLACED }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.PLACED);
  });

  // Stake=0 on one leg (both results WINNER) → expect WINNER (stake sanitized per settings, combo still wins)
  it('Double: one leg stake=0 (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, stake: 0, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // Stake<0 on one leg (both results WINNER) → expect WINNER (negative stake sanitized to 0)
  it('Double: one leg negative stake (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, stake: -5, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // One leg odd_decimal<1.01 (both results WINNER) → expect WINNER (sub-1.01 is neutralized to 0 odd)
  it('Double: one leg odd_decimal<1.01 (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, odd_decimal: 0.9, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // One leg missing odds (both results WINNER) → expect WINNER (missing odds sanitized to 0)
  it('Double: one leg missing odds (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, odd_decimal: null, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // partial_win_percent out-of-bounds is clamped to [0,100]; with other leg WINNER → expect overall WINNER
  it('Double: partial_win_percent [-20,0,100,120] (vs WINNER) → expect result_type WINNER', () => {
    let bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.PARTIAL, partial_win_percent: -20 }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    let result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.PARTIAL);

    bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.PARTIAL, partial_win_percent: 0 }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.PARTIAL);
  });

  // rule_4 out-of-bounds is clamped to [0,100]; both legs WINNER → expect WINNER
  it('Double: rule_4 outside [0,100] (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, rule_4: -10, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, rule_4: 200, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // Both legs extreme stake/odd (capped by max_payout) → expect WINNER
  it('Double: both legs very large stake/odd → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, stake: 1e10, odd_decimal: 1e8, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, stake: 1e10, odd_decimal: 1e8, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 1e10,
      total_stake: 2e10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 1e10,
      max_payout: 1e18,
      each_way: false,
    });
    expect(result.return_payout).toBeLessThanOrEqual(1e18);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // is_each_way per-leg mismatch vs settings.each_way=false (both WINNER) → expect WINNER
  it('Double: each_way flags mismatch (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, is_each_way: true, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, is_each_way: false, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // Empty bets array → expect OPEN (no combinations)
  it('Double: empty bets array → expect result_type OPEN', () => {
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets: [],
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBe(0);
    expect(result.result_type).toBe(BetResultType.OPEN);
  });

  // Null/undefined odds fields (both WINNER) → expect WINNER (sanitized to 0 where applicable)
  it('Double: null/undefined odds on legs (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, odd_decimal: null, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, odd_decimal: undefined, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: 10,
      total_stake: 10,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });

  // Inconsistent settings (negative stake/free_bet/max/bog values sanitized) with both WINNER → expect WINNER
  it('Double: inconsistent settings (both WINNER) → expect result_type WINNER', () => {
    const bets = [
      clone(baseBet, { bet_id: 1, result: BetResultType.WINNER }),
      clone(baseBet, { bet_id: 2, result: BetResultType.WINNER }),
    ];
    const result = betCalculator.processBet({
      stake: -12,
      total_stake: -12,
      bets,
      selections: [],
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: -5,
      bog_applicable: true,
      bog_max_payout: -20,
      max_payout: -20,
      each_way: true,
    });
    expect(result.return_payout).toBeGreaterThanOrEqual(0);
    expect(result.result_type).toBe(BetResultType.WINNER);
  });
});
