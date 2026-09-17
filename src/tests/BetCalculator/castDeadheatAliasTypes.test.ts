/**
 * Dead-heat coverage for greyhound alias bet types and swinger.
 *
 * Context:
 *   - "exacta"   is an alias for forecast_single  → routes through calculateForecast
 *   - "trifecta" is an alias for tricast_single    → routes through calculateTricast
 *   - "swinger"  routes through calculateSwinger
 *
 * No cast type applies a dead-heat divisor: the tote declares a separate dividend per
 * winning combination and the reduction is already inside those prices (confirmed by
 * trading 2026-07-30).  A straight bet is one line and pays its own ordering only.
 *
 * The existing deadheatDividends.test.js covers forecast_single and tricast_single
 * thoroughly.  This file adds one canonical dead-heat case for each alias to confirm
 * the routing is identical, plus swinger dead-heat tests.
 */
import { BetResultType } from '../../common/constants/betResultType';
import { CastCalculator } from '../../BetCalculator/castCalculator';
import { RaceSelectionStatus } from '../../BetCalculator/castConstants';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.
const betResultTypes = BetResultType;
const CastCalculatorService = new CastCalculator();

const W = RaceSelectionStatus.WINNER;
const mk = (...ids) => ids.map((id) => ({ selection_id: id, odd: 3, status: W }));

// ─── Exacta (forecast alias) dead-heat ──────────────────────────────────────
//
// "exacta" maps to calculateForecast → straightCastHitOdd, exactly the same code
// path as "forecast_single".  On a 2-way dead-heat for 1st a straight exacta wins
// in either order, and pays the dividend declared for the order it backed.
//
// Oracle: stake=1, dividends A_B=12, B_A=8
//   A→B pays 1 * 12 = 12.00 ; B→A pays 1 * 8 = 8.00

describe('Exacta dead-heat (alias for forecast_single)', () => {
  const dh1st = [
    { selection_id: 'A', position: 1 },
    { selection_id: 'B', position: 1 },
  ];

  it('2-way DH for 1st: straight A->B pays its own combination in full (12.00)', () => {
    const combos = new Map([
      ['A_B', 12],
      ['B_A', 8],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 100,
      bets: mk('A', 'B'),
      selections: dh1st,
      dividend: 10,
      stake: 1,
      bet_type: 'exacta',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(12, 2); // 1 * 12 (A_B), no reduction
  });

  it('2-way DH for 1st: straight B->A also wins, at the B_A dividend (8.00)', () => {
    const combos = new Map([
      ['A_B', 12],
      ['B_A', 8],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 101,
      bets: mk('B', 'A'),
      selections: dh1st,
      dividend: 10,
      stake: 1,
      bet_type: 'exacta',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(8, 2); // 1 * 8 (B_A)
  });

  it('CLEAN result (no DH): pays exact-order dividend only, no halving', () => {
    const clean = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
    ];
    const combos = new Map([['A_B', 12]]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 102,
      bets: mk('A', 'B'),
      selections: clean,
      dividend: 10,
      stake: 1,
      bet_type: 'exacta',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(12, 2); // 1 * 12, full
  });
});

// ─── Trifecta (tricast alias) dead-heat ─────────────────────────────────────
//
// "trifecta" maps to calculateTricast → straightCastHitOdd, exactly the same code
// path as "tricast_single".  On a dead-heat the punter's own ordering pays in full.
//
// Oracle: stake=1, dividends A_B_C=40, B_A_C=30
//   A->B->C pays 1 * 40 = 40.00

describe('Trifecta dead-heat (alias for tricast_single)', () => {
  it('2-way DH for 1st, clear 3rd: straight A->B->C pays the A_B_C dividend (40.00)', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 3 },
    ];
    const combos = new Map([
      ['A_B_C', 40],
      ['B_A_C', 30],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 200,
      bets: mk('A', 'B', 'C'),
      selections: sels,
      dividend: 10,
      stake: 1,
      bet_type: 'trifecta',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(40, 2); // 1 * 40, the ordering the punter backed
  });

  it('2-way DH for 2nd (A clear 1st, B&C tie 2nd): straight A->B->C pays A_B_C only (40.00)', () => {
    // B and C share 2nd place, so the model produces two winning perms — [A,B,C] and
    // [A,C,B].  The punter bought ONE line (A->B->C); the fact that A->C->B also won
    // is irrelevant, they didn't back it.  Payout = A_B_C = 40.00, no reduction.
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
      { selection_id: 'C', position: 2 },
    ];
    const combos = new Map([
      ['A_B_C', 40],
      ['A_C_B', 36],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 201,
      bets: mk('A', 'B', 'C'),
      selections: sels,
      dividend: 10,
      stake: 1,
      bet_type: 'trifecta',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(40, 2); // A_B_C only
  });

  it('CLEAN result (no DH): pays single exact-order dividend only', () => {
    const clean = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
      { selection_id: 'C', position: 3 },
    ];
    const combos = new Map([['A_B_C', 40]]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 202,
      bets: mk('A', 'B', 'C'),
      selections: clean,
      dividend: 10,
      stake: 1,
      bet_type: 'trifecta',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(40, 2); // 1 * 40, full
  });
});

// ─── Swinger dead-heat (no divisor, same rule as every other cast) ──────────
//
// The swinger uses isTopPositions() — it checks whether both picks appear in
// selections.slice(0, 3), not whether they finished in any specific order.
// calculateSwinger() returns { odd: dividend } with NO dead-heat divisor.
// This is correct behaviour: the swinger tote pool already accounts for dead-heats
// in its declared dividend, so no further reduction is applied.
//
// Test 1: 2-way DH for 1st (A=1, B=1, C=3).  Punter picks A and B.
//   Both are in positions 1 and 1, both appear in selections[0..2] → HIT.
//   Payout = stake * dividend (no halving).
//
// Test 2: 3-way DH for 1st (A=1, B=1, C=1).  Punter picks A and B.
//   Both at position 1, both in selections[0..2] → HIT at full dividend.
//
// Test 3: One pick NOT in top-3 of a dead-heat race → LOSER.

describe('Swinger dead-heat (no divisor by design)', () => {
  it('2-way DH for 1st (A&B tie 1st, C 3rd): both picks in top 3 → HIT at full dividend', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 3 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 300,
      bets: mk('A', 'B'),
      selections: sels,
      dividend: 8,
      stake: 2,
      bet_type: 'swinger',
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    // No dead-heat divisor: payout = stake * dividend = 2 * 8 = 16
    expect(r.winAmount).toBeCloseTo(16, 2);
  });

  it('3-way DH for 1st (A&B&C all tie 1st): both picks {A,B} in top 3 → HIT at full dividend', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 1 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 301,
      bets: mk('A', 'B'),
      selections: sels,
      dividend: 5,
      stake: 3,
      bet_type: 'swinger',
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    // No dead-heat divisor: payout = 3 * 5 = 15
    expect(r.winAmount).toBeCloseTo(15, 2);
  });

  it('DH for 1st but one pick NOT in top 3 (D is 4th) → LOSER', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 3 },
      { selection_id: 'D', position: 4 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 302,
      bets: mk('A', 'D'),
      selections: sels,
      dividend: 8,
      stake: 2,
      bet_type: 'swinger',
    });
    expect(r.mainResult).toEqual(betResultTypes.LOSER);
    expect(r.winAmount).toBeCloseTo(0, 2);
  });
});
