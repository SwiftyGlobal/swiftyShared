import { CastCalculator } from '../../BetCalculator/castCalculator';

// Aliased to the worker's names so the expectations below stay identical to
// swiftyPredictionsELBAPI/tests/casts — any drift in this port fails them.

const CastCalculatorService = new CastCalculator();

/**
 * Abandoned / void market rule (Trello 5654):
 *   A cast bet is VOID when its race was abandoned or voided by the feed, because no cast
 *   dividend is ever declared for a race that never ran, so the win/lose path can neither
 *   pay nor void and the bet sits open forever. Independent of runner count — unlike the
 *   field-size gate, an abandoned race can still have 3+ declared runners.
 *
 *   Provider status codes (from each provider's getEventDetails / the per-feed handlers):
 *     - PA  ("d"): "Abandoned", "RaceVoid", "Race Void"
 *     - SIS ("c"): "A", "V"
 *     - RAS ("h"): "ABANDONED"
 */
describe('shouldVoidCastForAbandonedEvent', () => {
  describe('voids when the feed reports the race abandoned/void', () => {
    const ABANDONED = [
      ['d', 'Abandoned'],
      ['d', 'RaceVoid'],
      ['d', 'Race Void'],
      ['c', 'A'],
      ['c', 'V'],
      ['h', 'ABANDONED'],
    ];
    ABANDONED.forEach(([bet_provider, status]) => {
      it(`voids provider "${bet_provider}" with status "${status}"`, () => {
        expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider, status })).toBe(true);
      });
    });
  });

  describe('does NOT void a live / resulted / open race', () => {
    const NOT_ABANDONED = [
      ['d', 'Finished'],
      ['d', 'Dormant'],
      ['d', 'Result'],
      ['d', ''],
      ['c', 'O'], // SIS open
      ['c', 'R'],
      ['h', 'RESULT'],
      ['h', 'OPEN'],
      ['h', 'FINISHED'],
    ];
    NOT_ABANDONED.forEach(([bet_provider, status]) => {
      it(`does NOT void provider "${bet_provider}" with status "${status}"`, () => {
        expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider, status })).toBe(false);
      });
    });
  });

  describe('guards', () => {
    it('returns false for an unknown provider even with an abandoned-looking status', () => {
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'x', status: 'Abandoned' })).toBe(
        false,
      );
    });
    it('returns false when status is null/undefined (data not ready)', () => {
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'd', status: null })).toBe(false);
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'd', status: undefined })).toBe(
        false,
      );
    });
    it('is case-sensitive (exact feed strings only), so a lowercased status does not void', () => {
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'd', status: 'abandoned' })).toBe(
        false,
      );
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'c', status: 'a' })).toBe(false);
    });
    it("does not cross providers (SIS 'A' must not void via PA, PA 'Abandoned' must not void via SIS)", () => {
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'd', status: 'A' })).toBe(false);
      expect(CastCalculatorService.shouldVoidCastForAbandonedEvent({ bet_provider: 'c', status: 'Abandoned' })).toBe(
        false,
      );
    });
  });
});
