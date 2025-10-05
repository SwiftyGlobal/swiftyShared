import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';

describe('Double Simple Winner Case', () => {
  const betCalculator = new BetCalculator();

  it('Double Win Case', () => {
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

  it('Double Win Case - Loser', () => {
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

  it('Double Win Case with three selections - One loser ', () => {
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

  it('Double Win Case - Each Way', () => {
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

  it('Double Win Case - Each Way - One Placed - One Loser', () => {
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

  it('Double Win Case - Each Way - Void', () => {
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

  it('Double Win Case - One Void', () => {
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

  it('Double Win Case - One Void', () => {
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

  it.only('Double Win Case - One Placed', () => {
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

  it('Double Win Case - Rule4', () => {
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

  it('Double Win Case - Rule4 - EW', () => {
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
