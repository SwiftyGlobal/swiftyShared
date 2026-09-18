import { CastCalculator } from '../../BetCalculator/castCalculator';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.

const CastCalculatorService = new CastCalculator();

/**
 * Field-size void rule:
 *   Any cast bet (forecast_*, exacta, swinger, tricast_*, trifecta) is VOID when
 *   fewer than 3 runners took part. Applies to BOTH horse and greyhound racing.
 *   Strictly less-than: exactly 3 does NOT void. Non-cast bets are never voided.
 */
describe('shouldVoidCastForFieldSize', () => {
  const CAST_TYPES = [
    'forecast_single',
    'forecast_reverse',
    'forecast_combination',
    'exacta',
    'swinger',
    'tricast_single',
    'tricast_reverse',
    'tricast_combination',
    'trifecta',
  ];

  describe('voids any cast bet when fewer than 3 ran', () => {
    CAST_TYPES.forEach((bet_type) => {
      [0, 1, 2].forEach((totalRealRunners) => {
        it(`voids ${bet_type} with ${totalRealRunners} runner(s)`, () => {
          expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type, totalRealRunners })).toBe(true);
        });
      });
    });
  });

  describe('does NOT void when 3 or more ran', () => {
    CAST_TYPES.forEach((bet_type) => {
      it(`does NOT void ${bet_type} with exactly 3 runners (boundary)`, () => {
        expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type, totalRealRunners: 3 })).toBe(false);
      });
      it(`does NOT void ${bet_type} with 8 runners`, () => {
        expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type, totalRealRunners: 8 })).toBe(false);
      });
    });
  });

  describe('non-cast bet types are never voided by this rule', () => {
    ['race_winner', 'each_way', 'starting_price'].forEach((bet_type) => {
      it(`returns false for ${bet_type} even with 1 runner`, () => {
        expect(CastCalculatorService.shouldVoidCastForFieldSize({ bet_type, totalRealRunners: 1 })).toBe(false);
      });
    });
  });
});
