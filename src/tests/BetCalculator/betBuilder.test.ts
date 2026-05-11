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

const settle = (calculator: BetCalculator, args: { stake: number; stored_payout: number; bets: PlacedBetSelection[] }) =>
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
    stored_payout: args.stored_payout,
  });

// Settlement rule:
//   all winners                          → payout = stored_payout (verbatim)
//   exactly 1 winner + rest all void     → payout = win_odd × stake
//                                          (single-survivor — applies for ANY
//                                          number of legs; bet collapses to a
//                                          single on the survivor)
//   ≥2 winners + ≥1 void                 → formula B: new_odds = (stored_payout / stake) / ∏ voided_odds
//                                          payout = new_odds × stake
//   any loser                            → payout = 0
//   all voids                            → refund stake
describe('Bet Builder — settlement (N-leg single-survivor + formula B for ≥2 survivors)', () => {
  const calc = new BetCalculator();

  it('2 legs, 1 void → settles as single at survivor\'s straight price (ignores BB combined margin)', () => {
    // BB combined intentionally 2.5 (lower than the no-margin acca 1.5 × 2.0 = 3.0
    // so the margin is visible). New rule pays survivor's odd × stake = 1.5 × 10 = $15,
    // NOT formula B's (2.5 / 2.0) × 10 = $12.50.
    const r = settle(calc, {
      stake: 10,
      stored_payout: 25,
      bets: [leg(BetResultType.VOID, 2.0, 1), leg(BetResultType.WINNER, 1.5, 2)],
    });
    expect(r.return_payout).toBeCloseTo(15, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('2 legs, 1 void (asymmetric fixture distinguishes new rule from formula B)', () => {
    // stake 10, void odd 4.0, survivor odd 2.0, stored_payout 60 (BB combined 6.0).
    // New rule: 2.0 × 10 = $20.
    // Formula B (if regressed): (6.0 / 4.0) × 10 = $15. Asserts we land on the new rule.
    const r = settle(calc, {
      stake: 10,
      stored_payout: 60,
      bets: [leg(BetResultType.VOID, 4.0, 1), leg(BetResultType.WINNER, 2.0, 2)],
    });
    expect(r.return_payout).toBeCloseTo(20, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('Spec card Ex 2: 3 legs, 1 void → BB combined 4.50 ÷ void 2.00 = 2.25 → $22.50', () => {
    const r = settle(calc, {
      stake: 10,
      stored_payout: 45, // BB combined = 4.50
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.WINNER, 1.5, 2),
        leg(BetResultType.WINNER, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(22.5, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('3 legs, 2 voids (single survivor) → settles at survivor\'s straight price', () => {
    // Single surviving leg at odd 1.8, stake 10 → payout 1.8 × 10 = $18.
    // (Fixture has stored_payout 54 = 1.8 × 2.0 × 1.5 × 10, no margin baked
    // in, so the new rule and formula B coincidentally agree here — the
    // dedicated asymmetric 3-leg test below proves the rules differ.)
    const r = settle(calc, {
      stake: 10,
      stored_payout: 54,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.VOID, 1.5, 2),
        leg(BetResultType.WINNER, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(18, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('3 legs, 2 voids — asymmetric fixture distinguishes single-survivor rule from formula B', () => {
    // stake 10, voids 2.0 + 4.0, survivor 1.5, stored_payout 60 (BB combined
    // 6.0, deliberately != un-margined acca 1.5 × 2.0 × 4.0 = 12 so the BB
    // margin/correlation is visible). Single-survivor rule: 1.5 × 10 = $15.
    // Formula B (regression): (6.0 / 8.0) × 10 = $7.50.
    const r = settle(calc, {
      stake: 10,
      stored_payout: 60,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.VOID, 4.0, 2),
        leg(BetResultType.WINNER, 1.5, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(15, 5);
    expect(r.result_type).toBe(BetResultType.WINNER);
  });

  it('4 legs, 2 voids middle → BB combined ÷ (void1 × void2)', () => {
    // BB combined 13.5, voids 1.8 × 2.0 = 3.6 → new odds 3.75 → $37.50
    const r = settle(calc, {
      stake: 10,
      stored_payout: 135,
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

  it('6 legs, 5 voids (single survivor) → settles at survivor\'s straight price ($17.50)', () => {
    // Single surviving leg at odd 1.75, stake 10 → payout 1.75 × 10 = $17.50.
    // (Fixture stored_payout 330.75 has no margin baked in so formula B
    // would also give $17.50 — assertion unchanged from prior versions.)
    const r = settle(calc, {
      stake: 10,
      stored_payout: 330.75,
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

  it('All winners → returns stored_payout verbatim (no recompute)', () => {
    const r = settle(calc, {
      stake: 10,
      stored_payout: 54,
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
      stored_payout: 54,
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
      stored_payout: 54,
      bets: [
        leg(BetResultType.VOID, 2.0, 1),
        leg(BetResultType.VOID, 1.5, 2),
        leg(BetResultType.VOID, 1.8, 3),
      ],
    });
    expect(r.return_payout).toBeCloseTo(10, 5);
    expect(r.result_type).toBe(BetResultType.VOID);
  });

  it('stored_payout = 0 (with non-trivial result) → throws', () => {
    expect(() =>
      settle(calc, {
        stake: 10,
        stored_payout: 0,
        bets: [leg(BetResultType.WINNER, 2.0, 1), leg(BetResultType.WINNER, 1.5, 2)],
      }),
    ).toThrow(/stored_payout must be > 0/);
  });
});
