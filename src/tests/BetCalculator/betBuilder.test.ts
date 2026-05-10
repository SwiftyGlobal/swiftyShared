import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';

const leg = (result: BetResultType, odd_decimal: number, bet_id = 1): PlacedBetSelection => ({
  bet_id,
  stake: 0,
  result,
  is_starting_price: false,
  sp_odd_fractional: '',
  odd_fractional: '',
  ew_terms: '',
  partial_win_percent: 0,
  rule_4: 0,
  is_each_way: false,
  sp_odd_decimal: 0,
  odd_decimal,
});

const settle = (calculator: BetCalculator, args: { stake: number; decimal: number; bets: PlacedBetSelection[] }) =>
  calculator.processBet({
    stake: args.stake,
    total_stake: args.stake,
    bets: args.bets,
    bet_type: BetSlipType.BET_BUILDER,
    free_bet_amount: 0,
    bog_applicable: false,
    bog_max_payout: 0,
    max_payout: 0,
    each_way: false,
    decimal: args.decimal,
  });

describe('Bet Builder — settlement (spec coverage)', () => {
  const calc = new BetCalculator();

  it('Ex 1: 2 legs, 1 void → settles as single at survivor (1.50) → $15 on $10', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 2.5,
      bets: [leg(BetResultType.VOID, 2.0, 1), leg(BetResultType.WINNER, 1.5, 2)],
    });
    expect(r.return_payout).toBeCloseTo(15, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('Ex 2: 3 legs, 1 void → acca of survivors (1.50 × 1.80) × 10 = $27', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.WINNER, 1.5, 2),
        leg(BetResultType.WINNER, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(27, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('Ex 3: 3 legs, 2 voids → single survivor at 1.80 → $18', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.VOID, 1.5, 2),
        leg(BetResultType.WINNER, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(18, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('Ex 5: 4 legs, 2 voids middle → (1.50 × 2.50) × 10 = $37.50', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 13.5,
      bets: [
        leg(BetResultType.WINNER, 1.5, 1),
        leg(BetResultType.VOID, 1.8, 2),
        leg(BetResultType.VOID, 2.0, 3),
        leg(BetResultType.WINNER, 2.5, 4),
      ],
    });
    expect(r.return_payout).toBeCloseTo(37.5, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('Ex 7: 6 legs, 5 voids → single survivor at 1.75 → $17.50', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 33.08,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.VOID, 1.5, 2),
        leg(BetResultType.VOID, 1.8, 3),
        leg(BetResultType.VOID, 2.5, 4),
        leg(BetResultType.VOID, 1.4, 5),
        leg(BetResultType.WINNER, 1.75, 6),
      ],
    });
    expect(r.return_payout).toBeCloseTo(17.5, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('All winners → uses decimal (combined BB price) × stake (unchanged behaviour)', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.WINNER, 2.0, 1),
        leg(BetResultType.WINNER, 1.5, 2),
        leg(BetResultType.WINNER, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(54, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('Any losing leg → bet loses (payout = 0)', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.WINNER, 2.0, 1),
        leg(BetResultType.LOSER, 1.5, 2),
        leg(BetResultType.VOID, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(0, 5);
    expect(r.result_type).toBe(BetResultType.LOSER);
  });

  it('All voids → refund stake', () => {
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.VOID, 1.5, 2),
        leg(BetResultType.VOID, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(10, 5);
    expect(r.result_type).toBe(BetResultType.VOID);
  });

  it('All winners but decimal = 0 → throws', () => {
    expect(() =>
      settle(calc, {
        stake: 10,
        decimal: 0,
        bets: [leg(BetResultType.WINNER, 2.0, 1), leg(BetResultType.WINNER, 1.5, 2)],
      }),
    ).toThrow(/decimal must be > 0/);
  });

  it('half_won uses odd/2 as effective survivor odd', () => {
    // half_won 2.0 → 1.0; × winner 1.5 → 1.5 × $10 = $15
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.HALF_WON, 2.0, 1),
        leg(BetResultType.WINNER, 1.5, 2),
        leg(BetResultType.VOID, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(15, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('half_lost uses 0.5 as effective survivor odd', () => {
    // half_lost → 0.5; × winner 1.8 → 0.9 × $10 = $9
    const r = settle(calc, {
      stake: 10,
      decimal: 5.4,
      bets: [
        leg(BetResultType.HALF_LOST, 2.0, 1),
        leg(BetResultType.WINNER, 1.8, 2),
        leg(BetResultType.VOID, 1.5, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(9, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });
});
