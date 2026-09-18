import { BetResultType } from '../../common/constants/betResultType';
import { CastCalculator } from '../../BetCalculator/castCalculator';
import { CastResultType, RaceSelectionStatus } from '../../BetCalculator/castConstants';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.
const betResultTypes = BetResultType;
const castResultTypes = CastResultType;
const CastCalculatorService = new CastCalculator();

// Regression: SIS forecast graded WINNER but paid £0 (incident: tigerbet bet #154733 / multiple 40451).
//
// The bet's selection_ids arrive as STRINGS (user_bets_single.bet_id), while the SIS feed's
// finishing positions (bet_places.selection_id) arrive as NUMBERS. The win gate in
// straightCastHitOdd uses loose == (areIdentical) so it correctly grades a HIT, but the payout
// line built a Set of the string ids and tested it with Set.has(numberId) — a strict ===
// comparison that never matches across types. `covered` came out empty, so the payout was
// 0/N = 0, paying a winning forecast nothing despite a real dividend (4.28) being fetched.
describe('Forecast — string bet ids vs numeric finishing-position ids (SIS shape)', () => {
  it('pays stake × dividend on a HIT even when bet ids are strings and position ids are numbers', () => {
    // Real shape from the incident: bet.selection_id is a STRING, selections.selection_id is a NUMBER.
    const bets = [
      { selection_id: '52471939', odd: 1.72727, status: RaceSelectionStatus.WINNER },
      { selection_id: '52471941', odd: 5.5, status: RaceSelectionStatus.PLACED },
    ];
    const selections = [
      { selection_id: 52471939, position: 1 },
      { selection_id: 52471941, position: 2 },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 40451,
      bets,
      selections,
      dividend: 4.28,
      stake: 15,
      bet_type: 'forecast_single',
    });

    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.results[0].result).toEqual(castResultTypes.HIT);
    // 15 × 4.28 = 64.20 — the amount the trader had to pay out by hand.
    expect(result.winAmount).toBeCloseTo(64.2, 5);
  });

  it('still LOSES (no spurious payout) when a string-id bet has the wrong order', () => {
    // Punter picked 52471941 → 52471939 but the result was 52471939 (1st) → 52471941 (2nd).
    const bets = [
      { selection_id: '52471941', odd: 5.5, status: RaceSelectionStatus.PLACED },
      { selection_id: '52471939', odd: 1.72727, status: RaceSelectionStatus.WINNER },
    ];
    const selections = [
      { selection_id: 52471939, position: 1 },
      { selection_id: 52471941, position: 2 },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 1,
      bets,
      selections,
      dividend: 4.28,
      stake: 15,
      bet_type: 'forecast_single',
    });

    expect(result.mainResult).toEqual(betResultTypes.LOSER);
    expect(result.winAmount).toEqual(0);
  });
});

// Swinger uses isTopPositions (Array.includes, strict ===) instead of straightCastHitOdd,
// so it had the same string-bet-id vs numeric-position-id mismatch.
describe('Swinger — string bet ids vs numeric finishing-position ids (SIS shape)', () => {
  it('pays on a HIT when both picks are in the top 3, with string bets and numeric positions', () => {
    const bets = [
      { selection_id: '52471939', odd: 2.0, status: RaceSelectionStatus.WINNER },
      { selection_id: '52471943', odd: 4.0, status: RaceSelectionStatus.RUNNER },
    ];
    const selections = [
      { selection_id: 52471939, position: 1 },
      { selection_id: 52471941, position: 2 },
      { selection_id: 52471943, position: 3 },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 1,
      bets,
      selections,
      dividend: 2.5,
      stake: 10,
      bet_type: 'swinger',
    });

    expect(result.mainResult).toEqual(betResultTypes.WINNER);
    expect(result.results[0].result).toEqual(castResultTypes.HIT);
    expect(result.winAmount).toBeCloseTo(25, 5); // 10 × 2.5
  });

  it('still LOSES when a pick is outside the top 3 (string/numeric ids)', () => {
    const bets = [
      { selection_id: '52471939', odd: 2.0, status: RaceSelectionStatus.WINNER },
      { selection_id: '52471999', odd: 4.0, status: RaceSelectionStatus.LOSER },
    ];
    const selections = [
      { selection_id: 52471939, position: 1 },
      { selection_id: 52471941, position: 2 },
      { selection_id: 52471943, position: 3 },
    ];

    const result = CastCalculatorService.calculateCasts({
      prefix: 'test',
      betted_id: 1,
      bets,
      selections,
      dividend: 2.5,
      stake: 10,
      bet_type: 'swinger',
    });

    expect(result.mainResult).toEqual(betResultTypes.LOSER);
    expect(result.winAmount).toEqual(0);
  });
});
