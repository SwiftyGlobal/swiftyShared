/**
 * Cast non-runner rules — industry compliance, at the calculator level.
 *
 * These branches were unreachable from the settlement worker between commit e462f068 (2025-09-03)
 * and the fix: resultCasts mapped the provider status to a betResultTypes value BEFORE handing the
 * selections to CastCalculatorService, which compares against RaceSelectionStatus, so every
 * non-runner check was false and a non-runner cast graded MISSED -> LOSER for £0. The mapping now
 * happens only where the leg result is persisted.
 *
 * Rules encoded here (fixed-odds, not tote — confirmed for Swifty):
 *   Forecast, 1 non-runner        -> win single on the survivor at its SP
 *   Forecast, 2 non-runners       -> void, refund
 *   Reverse forecast, 1 NR        -> BOTH lines become win singles at SP (both contained the NR)
 *   Combination forecast, 1 NR    -> lines touching the NR become win singles at SP;
 *                                    lines between survivors stand as normal
 *   Tricast, 1 non-runner         -> CSF on the survivors, in the punter's original order,
 *                                    priced at the FORECAST dividend (not the tricast dividend)
 *   Tricast, 2 non-runners        -> win single on the survivor at its SP
 *   Combination tricast, 1 NR     -> affected lines become a forecast on the survivors, in the
 *                                    order they hold in THAT line, priced at the FORECAST dividend
 */
import { BetResultType } from '../../common/constants/betResultType';
import { CastCalculator } from '../../BetCalculator/castCalculator';
import { CastResultType, RaceSelectionStatus } from '../../BetCalculator/castConstants';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.
const betResultTypes = BetResultType;
const castResultTypes = CastResultType;
const CastCalculatorService = new CastCalculator();

const STAKE = 2;
const bet = (selection_id, status, odd) => ({ selection_id, odd, status });
const place = (selection_id, position) => ({ selection_id, position });

function calc(args) {
  return CastCalculatorService.calculateCasts({ prefix: 'TEST', betted_id: 1, stake: STAKE, ...args });
}
const kinds = (r) => r.results.map((x) => x.result);
const paid = (r) => r.results.reduce((a, x) => a + x.stake * x.odd, 0);

// ── FORECAST ────────────────────────────────────────────────────────────────

describe('forecast non-runner rules', () => {
  it("1 non-runner + the survivor won -> win single at the survivor's SP", () => {
    const r = calc({
      bet_type: 'forecast_single',
      bets: [bet('A', RaceSelectionStatus.WINNER, 4.5), bet('B', RaceSelectionStatus.NON_RUNNER, 3)],
      selections: [place('A', 1), place('C', 2)],
      dividend: 20,
    });
    expect(kinds(r)).toEqual([castResultTypes.SINGLE]);
    expect(paid(r)).toBeCloseTo(STAKE * 4.5, 5); // NOT the 20.0 forecast dividend
    expect(r.mainResult).toBe(betResultTypes.PARTIAL);
  });

  it('1 non-runner + the survivor did not win -> the win single loses', () => {
    const r = calc({
      bet_type: 'forecast_single',
      bets: [bet('A', RaceSelectionStatus.PLACED, 4.5), bet('B', RaceSelectionStatus.NON_RUNNER, 3)],
      selections: [place('C', 1), place('A', 2)],
      dividend: 20,
    });
    expect(kinds(r)).toEqual([castResultTypes.MISSED]);
    expect(paid(r)).toBe(0);
    expect(r.mainResult).toBe(betResultTypes.LOSER);
  });

  it('2 non-runners -> void, stake refunded at odd 1', () => {
    const r = calc({
      bet_type: 'forecast_single',
      bets: [bet('A', RaceSelectionStatus.NON_RUNNER, 4.5), bet('B', RaceSelectionStatus.NON_RUNNER, 3)],
      selections: [place('C', 1), place('D', 2)],
      dividend: 20,
    });
    expect(kinds(r)).toEqual([castResultTypes.VOID]);
    expect(paid(r)).toBeCloseTo(STAKE, 5);
    expect(r.mainResult).toBe(betResultTypes.VOID);
  });

  it('reverse forecast, 1 non-runner -> BOTH lines become win singles at SP', () => {
    // Both orderings contained the withdrawn runner, so the punter's whole stake rides the single.
    const r = calc({
      bet_type: 'forecast_reverse',
      bets: [bet('A', RaceSelectionStatus.WINNER, 4.5), bet('B', RaceSelectionStatus.NON_RUNNER, 3)],
      selections: [place('A', 1), place('C', 2)],
      dividend: 20,
    });
    expect(kinds(r)).toEqual([castResultTypes.SINGLE, castResultTypes.SINGLE]);
    expect(paid(r)).toBeCloseTo(2 * STAKE * 4.5, 5);
  });

  it('combination forecast, 1 non-runner -> NR lines pay singles, survivor lines stand', () => {
    // A won, B was 2nd, C withdrawn. A->B stands and hits; the lines pairing C with A pay singles.
    const r = calc({
      bet_type: 'forecast_combination',
      bets: [
        bet('A', RaceSelectionStatus.WINNER, 4.5),
        bet('B', RaceSelectionStatus.PLACED, 3),
        bet('C', RaceSelectionStatus.NON_RUNNER, 7),
      ],
      selections: [place('A', 1), place('B', 2)],
      dividend: 20,
    });
    expect(kinds(r).filter((k) => k === castResultTypes.HIT)).toHaveLength(1); // A->B stands
    expect(kinds(r).filter((k) => k === castResultTypes.SINGLE)).toHaveLength(2); // A/C and C/A
    expect(paid(r)).toBeCloseTo(STAKE * 20 + 2 * STAKE * 4.5, 5);
  });
});

// ── TRICAST ─────────────────────────────────────────────────────────────────

describe('tricast non-runner rules', () => {
  const threeBets = (thirdStatus) => [
    bet('A', RaceSelectionStatus.WINNER, 4.5),
    bet('B', RaceSelectionStatus.PLACED, 3),
    bet('C', thirdStatus, 7),
  ];

  it('1 non-runner -> CSF on the survivors, priced at the FORECAST dividend', () => {
    const r = calc({
      bet_type: 'tricast_single',
      bets: threeBets(RaceSelectionStatus.NON_RUNNER),
      selections: [place('A', 1), place('B', 2), place('D', 3)],
      dividend: 90, // tricast dividend — must NOT be used
      forecastDividend: 6.5, // CSF dividend — must be used
    });
    expect(kinds(r)).toEqual([castResultTypes.FORECAST]);
    expect(paid(r)).toBeCloseTo(STAKE * 6.5, 5);
    expect(r.mainResult).toBe(betResultTypes.PARTIAL);
  });

  it('1 non-runner with no CSF dividend yet -> pending, never priced off the tricast dividend', () => {
    const r = calc({
      bet_type: 'tricast_single',
      bets: threeBets(RaceSelectionStatus.NON_RUNNER),
      selections: [place('A', 1), place('B', 2), place('D', 3)],
      dividend: 90,
      forecastDividend: null,
    });
    expect(kinds(r)).toEqual([castResultTypes.NOT_APPLICABLE]);
    expect(paid(r)).toBe(0);
    expect(r.mainResult).toBe(betResultTypes.OPEN);
  });

  it('1 non-runner but the survivors did not fill the top 2 -> loses', () => {
    const r = calc({
      bet_type: 'tricast_single',
      bets: threeBets(RaceSelectionStatus.NON_RUNNER),
      selections: [place('A', 1), place('D', 2), place('B', 3)],
      dividend: 90,
      forecastDividend: 6.5,
    });
    expect(kinds(r)).toEqual([castResultTypes.MISSED]);
    expect(r.mainResult).toBe(betResultTypes.LOSER);
  });

  it('2 non-runners -> win single on the survivor at its SP', () => {
    const r = calc({
      bet_type: 'tricast_single',
      bets: [
        bet('A', RaceSelectionStatus.WINNER, 4.5),
        bet('B', RaceSelectionStatus.NON_RUNNER, 3),
        bet('C', RaceSelectionStatus.NON_RUNNER, 7),
      ],
      selections: [place('A', 1), place('D', 2), place('E', 3)],
      dividend: 90,
      forecastDividend: 6.5,
    });
    expect(kinds(r)).toEqual([castResultTypes.SINGLE]);
    expect(paid(r)).toBeCloseTo(STAKE * 4.5, 5);
  });

  it('3 non-runners -> void, stake refunded', () => {
    const r = calc({
      bet_type: 'tricast_single',
      bets: [
        bet('A', RaceSelectionStatus.NON_RUNNER, 4.5),
        bet('B', RaceSelectionStatus.NON_RUNNER, 3),
        bet('C', RaceSelectionStatus.NON_RUNNER, 7),
      ],
      selections: [place('D', 1), place('E', 2), place('F', 3)],
      dividend: 90,
    });
    expect(kinds(r)).toEqual([castResultTypes.VOID]);
    expect(paid(r)).toBeCloseTo(STAKE, 5);
    expect(r.mainResult).toBe(betResultTypes.VOID);
  });
});

// ── COMBINATION TRICAST — the degraded-forecast rule ────────────────────────

describe("combination tricast, 1 non-runner -> forecast on the survivors, in the line's own order", () => {
  // 4 selections, D withdrawn, C won and B was 2nd. A combination tricast buys all 24 orderings,
  // so each line degrades on its own terms: the survivors keep the order they hold in that line
  // and must fill 1st and 2nd in it. Of the 6 lines built from {B, C, D}, the 3 that read C
  // before B pay; their 3 mirrors read B before C and miss — the punter already bought that
  // cover as its own line, so paying both orders would pay one piece of cover twice.
  const bets = [
    bet('A', RaceSelectionStatus.LOSER, 4.5),
    bet('B', RaceSelectionStatus.PLACED, 3),
    bet('C', RaceSelectionStatus.WINNER, 7),
    bet('D', RaceSelectionStatus.NON_RUNNER, 9),
  ];
  const selections = [place('C', 1), place('B', 2), place('E', 3)];

  // Which of this bet's 24 lines each rule pays, so the difference is explicit:
  //   survivors in line order = [C, B] -> C-B-D, C-D-B, D-C-B  (paid)
  //   survivors in line order = [B, C] -> B-C-D, B-D-C, D-B-C  (missed)
  const linesReading = (r, outcome) => r.results.filter((x) => x.result === outcome).length;

  it('pays only the lines whose survivors read in the finishing order, at the forecast dividend', () => {
    const r = calc({ bet_type: 'tricast_combination', bets, selections, dividend: 90, forecastDividend: 6.5 });

    const forecasts = r.results.filter((x) => x.result === castResultTypes.FORECAST);
    expect(forecasts).toHaveLength(3); // NOT 6 — the mirrored lines lose
    expect(linesReading(r, castResultTypes.MISSED)).toBe(21);
    expect(r.results).toHaveLength(24);
    // Priced at the CSF dividend, not the old `tricast / 2` guess (which would have been 45).
    for (const f of forecasts) expect(f.odd).toBeCloseTo(6.5, 5);
    expect(paid(r)).toBeCloseTo(3 * STAKE * 6.5, 5);
    expect(r.mainResult).toBe(betResultTypes.PARTIAL);
  });

  it("a straight tricast keeps the punter's own order too", () => {
    // Same race, bought as a single line C-B-D: the survivors read C then B, which is how they
    // finished, so it pays. Its mirror B-C-D is a different bet and loses.
    const wins = calc({
      bet_type: 'tricast_single',
      bets: [
        bet('C', RaceSelectionStatus.WINNER, 7),
        bet('B', RaceSelectionStatus.PLACED, 3),
        bet('D', RaceSelectionStatus.NON_RUNNER, 9),
      ],
      selections,
      dividend: 90,
      forecastDividend: 6.5,
    });
    expect(kinds(wins)).toEqual([castResultTypes.FORECAST]);
    expect(paid(wins)).toBeCloseTo(STAKE * 6.5, 5);

    const loses = calc({
      bet_type: 'tricast_single',
      bets: [
        bet('B', RaceSelectionStatus.PLACED, 3),
        bet('C', RaceSelectionStatus.WINNER, 7),
        bet('D', RaceSelectionStatus.NON_RUNNER, 9),
      ],
      selections,
      dividend: 90,
      forecastDividend: 6.5,
    });
    expect(kinds(loses)).toEqual([castResultTypes.MISSED]);
    expect(loses.mainResult).toBe(betResultTypes.LOSER);
  });

  it('holds those lines pending when no CSF dividend is available', () => {
    const r = calc({ bet_type: 'tricast_combination', bets, selections, dividend: 90, forecastDividend: null });

    expect(r.results.filter((x) => x.result === castResultTypes.FORECAST)).toHaveLength(0);
    expect(r.results.filter((x) => x.result === castResultTypes.NOT_APPLICABLE).length).toBeGreaterThan(0);
  });
});

// ── FIELD SIZE ──────────────────────────────────────────────────────────────

describe('shouldVoidCastForFieldSize', () => {
  it('voids any cast below 3 runners, and stands at exactly 3', () => {
    expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type: 'forecast_single', totalRealRunners: 2 })).toBe(
      true,
    );
    expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type: 'forecast_single', totalRealRunners: 3 })).toBe(
      false,
    );
    expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type: 'tricast_single', totalRealRunners: 2 })).toBe(
      true,
    );
  });

  it('leaves the tricast-specific minimum DISABLED by default', () => {
    // Industry practice is a larger minimum field for tricasts (commonly 8+ in handicaps), but the
    // threshold and the void-vs-settle-as-forecast choice are house rules. Until Trading sets them,
    // a 4-runner tricast must keep settling exactly as it does today.
    expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type: 'tricast_single', totalRealRunners: 4 })).toBe(
      false,
    );
    expect(
      CastCalculatorService.shouldVoidCastForFieldSize({ bet_type: 'tricast_combination', totalRealRunners: 7 }),
    ).toBe(false);
  });

  it('voids tricasts below the minimum once a threshold is supplied', () => {
    expect(
      CastCalculatorService.shouldVoidCastForFieldSize({
        bet_type: 'tricast_single',
        totalRealRunners: 7,
        tricastMinRunners: 8,
      }),
    ).toBe(true);
    expect(
      CastCalculatorService.shouldVoidCastForFieldSize({
        bet_type: 'tricast_single',
        totalRealRunners: 8,
        tricastMinRunners: 8,
      }),
    ).toBe(false);
    // Forecasts are unaffected by the tricast minimum.
    expect(
      CastCalculatorService.shouldVoidCastForFieldSize({
        bet_type: 'forecast_single',
        totalRealRunners: 4,
        tricastMinRunners: 8,
      }),
    ).toBe(false);
  });
});
