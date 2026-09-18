import { BetResultType } from '../../common/constants/betResultType';
import { CastCalculator } from '../../BetCalculator/castCalculator';
import { RaceSelectionStatus } from '../../BetCalculator/castConstants';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.
const betResultTypes = BetResultType;
const CastCalculatorService = new CastCalculator();

const W = RaceSelectionStatus.WINNER;
const mk = (...ids) => ids.map((id) => ({ selection_id: id, odd: 3, status: W }));

// ── Cast dead-heat rule (trading, 2026-07-30) ─────────────────────────────────
// On a dead heat the tote declares a SEPARATE dividend per winning combination and
// the dead-heat reduction is already priced into those dividends. So:
//   - NO 1/N reduction is ever applied to a cast payout.
//   - A straight forecast/tricast is one line: it wins if its exact ordering is a
//     winning ordering (dead-heated places being interchangeable), and pays the
//     dividend declared for THAT ordering — not for the orderings it didn't back.
//   - Reverse/combination bets pay each of their generated lines that wins, each at
//     its own dividend.
//   - A perm with no declared dividend falls back to the single event dividend.
// Reference incident: metabetting bet #258311 / multi 60593 — reverse forecast, dead
// heat for 1st, dividends 7.81 and 7.72, £65 a line: due 1,009.45, paid 507.65.

describe('Forecast dead-heat dividends', () => {
  const deadHeat1st = [
    { selection_id: 'A', position: 1 },
    { selection_id: 'B', position: 1 },
  ];

  it('2-way DH for 1st: straight A->B pays the A_B dividend in full (25.00)', () => {
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 1,
      bets: mk('A', 'B'),
      selections: deadHeat1st,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(25, 2); // 2 * 12.5
  });

  it('2-way DH for 1st: straight B->A also wins, at its own B_A dividend (18.00)', () => {
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 2,
      bets: mk('B', 'A'),
      selections: deadHeat1st,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(18, 2); // 2 * 9
  });

  it('3-way DH for 1st: straight A->B still pays only its own combination (25.00)', () => {
    const deadHeat3 = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 1 },
    ];
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 3,
      bets: mk('A', 'B'),
      selections: deadHeat3,
      dividend: 6,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(25, 2); // 2 * 12.5 — tie depth changes nothing
  });

  it('DH for 2nd (A clear 1st, B&C tie 2nd): straight A->B pays A_B in full (25.00)', () => {
    const dh2nd = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
      { selection_id: 'C', position: 2 },
    ];
    const combos = new Map([['A_B', 12.5]]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 4,
      bets: mk('A', 'B'),
      selections: dh2nd,
      dividend: 6,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(25, 2); // 2 * 12.5
  });

  it('DH for 2nd: WRONG-order B->A loses (A clearly won 1st)', () => {
    const dh2nd = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
      { selection_id: 'C', position: 2 },
    ];
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]); // B_A declared but must NOT be used
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 41,
      bets: mk('B', 'A'),
      selections: dh2nd,
      dividend: 6,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.LOSER);
    expect(r.winAmount).toBeCloseTo(0, 2);
  });

  it('DH for 2nd: B->C loses (neither finished 1st)', () => {
    const dh2nd = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
      { selection_id: 'C', position: 2 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 42,
      bets: mk('B', 'C'),
      selections: dh2nd,
      dividend: 6,
      stake: 2,
      bet_type: 'forecast_single',
    });
    expect(r.mainResult).toEqual(betResultTypes.LOSER);
    expect(r.winAmount).toBeCloseTo(0, 2);
  });

  it('CLEAN result: straight A->B wins exact order at full combo dividend (no reduction)', () => {
    const clean = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
    ];
    const combos = new Map([['A_B', 12.5]]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 5,
      bets: mk('A', 'B'),
      selections: clean,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(25, 2); // 2 * 12.5, full
  });

  it('CLEAN result: straight B->A (wrong order) loses', () => {
    const clean = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 6,
      bets: mk('B', 'A'),
      selections: clean,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_single',
    });
    expect(r.mainResult).toEqual(betResultTypes.LOSER);
    expect(r.winAmount).toBeCloseTo(0, 2);
  });

  it('no combos map + clean result: behaves as before (single dividend, exact order)', () => {
    const clean = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 7,
      bets: mk('A', 'B'),
      selections: clean,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_single',
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(14, 2); // 2 * 7
  });

  it('DH for 1st with only the other ordering declared: falls back to the single dividend', () => {
    // Only A_B declared; the punter backed B->A, which falls back to dividend 7.
    const combos = new Map([['A_B', 12.5]]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 8,
      bets: mk('B', 'A'),
      selections: deadHeat1st,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(14, 2); // 2 * 7 (fallback)
  });
});

describe('Reverse forecast dead-heat dividends', () => {
  const deadHeat1st = [
    { selection_id: 'A', position: 1 },
    { selection_id: 'B', position: 1 },
  ];

  it('2-way DH: both lines HIT, each at its own dividend in full (43.00 total)', () => {
    // This is the shape of bet #258311: reverse forecast, dead heat for 1st, two
    // dividends. Both lines were bought, so both dividends are paid in full.
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 9,
      bets: mk('A', 'B'),
      selections: deadHeat1st,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_reverse',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(43, 2); // 2*12.5 + 2*9
  });

  it('bet #258311 oracle: £65 a line, dividends 7.81 / 7.72 → 1,009.45', () => {
    const combos = new Map([
      ['A_B', 7.81],
      ['B_A', 7.72],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 258311,
      bets: mk('A', 'B'),
      selections: deadHeat1st,
      dividend: 7.81,
      stake: 65,
      bet_type: 'forecast_reverse',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(1009.45, 2); // 65*7.81 + 65*7.72
  });

  it('CLEAN result: only the actual order HITS (full), other line loses', () => {
    const clean = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
    ];
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 10,
      bets: mk('A', 'B'),
      selections: clean,
      dividend: 7,
      stake: 2,
      bet_type: 'forecast_reverse',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(25, 2); // 2 * 12.5 (A_B only), B_A loses
  });

  it('3-way DH for 1st (runnerPlaces has 3 rows): reverse {A,B} wins both lines in full', () => {
    const deadHeat3 = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 1 },
    ];
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 14,
      bets: mk('A', 'B'),
      selections: deadHeat3,
      dividend: 6,
      stake: 2,
      bet_type: 'forecast_reverse',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(43, 2); // 2*12.5 + 2*9
  });

  it('DH for 2nd (A 1st, B&C tie 2nd; 3 rows): reverse {A,B} wins A-B only (25.00)', () => {
    const dh2nd = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 2 },
      { selection_id: 'C', position: 2 },
    ];
    const combos = new Map([['A_B', 12.5]]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 15,
      bets: mk('A', 'B'),
      selections: dh2nd,
      dividend: 6,
      stake: 2,
      bet_type: 'forecast_reverse',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(25, 2); // A-B hits in full; B-A is not a winning perm
  });
});

describe('Tricast dead-heat dividends', () => {
  it('2 tie for 1st, clear 3rd: straight A->B->C pays its own ordering (40.00)', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 3 },
    ];
    const combos = new Map([
      ['A_B_C', 40],
      ['B_A_C', 35],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 11,
      bets: mk('A', 'B', 'C'),
      selections: sels,
      dividend: 10,
      stake: 1,
      bet_type: 'tricast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(40, 2); // 1 * 40
  });

  it('3 tie for 1st: straight tricast pays the ordering it backed, in full', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 1 },
    ];
    const combos = new Map([
      ['A_B_C', 30],
      ['A_C_B', 30],
      ['B_A_C', 30],
      ['B_C_A', 30],
      ['C_A_B', 30],
      ['C_B_A', 30],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 12,
      bets: mk('A', 'B', 'C'),
      selections: sels,
      dividend: 10,
      stake: 1,
      bet_type: 'tricast_single',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(30, 2); // 1 * 30 — one line, one dividend
  });
});

describe('Combination forecast dead-heat dividends', () => {
  it('3-runner combination, A&B tie 1st (C 3rd): A-B and B-A lines HIT, each in full', () => {
    const sels = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 3 },
    ];
    const combos = new Map([
      ['A_B', 12.5],
      ['B_A', 9],
    ]);
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 13,
      bets: mk('A', 'B', 'C'),
      selections: sels,
      dividend: 7,
      stake: 1,
      bet_type: 'forecast_combination',
      manualWinningCombos: combos,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(21.5, 2); // 12.5 + 9; the 4 lines containing C miss
  });
});

// ── Multi-position and large-field dead heats ──────────────────────────────────
// Tie depth (2-way, 3-way, ties on more than one place) never scales the payout —
// it only changes which orderings count as winning. These pin that.
describe('Forecast/Tricast dead-heat — tie depth does not reduce the payout', () => {
  it('tricast DH for BOTH 1st and 2nd: still one line at the single dividend', () => {
    // A,B tie 1st; C,D tie 2nd. Pick A->B->C (tricast). A-B-C is a winning ordering,
    // so it pays stake 2 × dividend 12 = 24 — no ÷2, no ÷4.
    const selections = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 2 },
      { selection_id: 'D', position: 2 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 20,
      bets: mk('A', 'B', 'C'),
      selections,
      dividend: 12,
      stake: 2,
      bet_type: 'tricast_single',
      manualWinningCombos: null,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(24, 2);
  });

  it('tricast wrong order on the spanning DH loses (C ran 2nd, cannot be 1st)', () => {
    // The win gate still applies: C->A->B is not a winning ordering (C tied 2nd).
    const selections = [
      { selection_id: 'A', position: 1 },
      { selection_id: 'B', position: 1 },
      { selection_id: 'C', position: 2 },
      { selection_id: 'D', position: 2 },
    ];
    const r = CastCalculatorService.calculateCasts({
      prefix: 't',
      betted_id: 21,
      bets: mk('C', 'A', 'B'),
      selections,
      dividend: 12,
      stake: 2,
      bet_type: 'tricast_single',
      manualWinningCombos: null,
    });
    expect(r.mainResult).toEqual(betResultTypes.LOSER);
    expect(r.winAmount).toBeCloseTo(0, 2);
  });

  it('4-way DH for 1st (greyhound field): forecast A->B pays the full dividend', () => {
    // A,B,C,D all tie 1st (4-way), E 5th. Pick A->B → stake 2 × dividend 8 = 16.
    const selections = ['A', 'B', 'C', 'D'].map((id) => ({ selection_id: id, position: 1 }));
    selections.push({ selection_id: 'E', position: 5 });
    const r = CastCalculatorService.calculateCasts({
      prefix: 'f',
      betted_id: 22,
      bets: mk('A', 'B'),
      selections,
      dividend: 8,
      stake: 2,
      bet_type: 'forecast_single',
      manualWinningCombos: null,
    });
    expect(r.mainResult).toEqual(betResultTypes.WINNER);
    expect(r.winAmount).toBeCloseTo(16, 2);
  });
});
