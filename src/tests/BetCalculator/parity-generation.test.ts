import { referenceGenerateNFolds, RefNFoldBet } from './__fixtures__/reference-generateNFolds';
import { priceCombinations, sameEventIncompatible, allCompatible, PriceableLeg } from '../../BetCalculator/combination-engine';

const toPriceable = (b: RefNFoldBet[]): PriceableLeg[] => b.map((x) => ({ ...x }));

// matrix of inputs (no darts/participant — see fixture note)
const cases: Array<{ name: string; bets: RefNFoldBet[]; n: number; ew: boolean; cross: boolean }> = [
  { name: '4 legs double', bets: [{ odd: 2 }, { odd: 3 }, { odd: 1.5 }, { odd: 4 }], n: 2, ew: false, cross: false },
  { name: '5 legs treble', bets: [{ odd: 2 }, { odd: 3 }, { odd: 1.5 }, { odd: 4 }, { odd: 2.5 }], n: 3, ew: false, cross: false },
  { name: 'each-way doubles', bets: [{ odd: 5, ew_terms: '1/4' }, { odd: 3, ew_terms: '1/5' }, { odd: 2, ew_terms: '1/4' }], n: 2, ew: true, cross: false },
  { name: 'starting price leg', bets: [{ odd: 2 }, { odd: 3, starting_price: true }, { odd: 4 }], n: 2, ew: false, cross: false },
  { name: 'cross doubles A2B2C1', bets: [{ odd: 2, event_id: 'A' }, { odd: 2, event_id: 'A' }, { odd: 2, event_id: 'B' }, { odd: 2, event_id: 'B' }, { odd: 2, event_id: 'C' }], n: 2, ew: false, cross: true },
  { name: 'cross trebles A2B2C1', bets: [{ odd: 2, event_id: 'A' }, { odd: 2, event_id: 'A' }, { odd: 2, event_id: 'B' }, { odd: 2, event_id: 'B' }, { odd: 2, event_id: 'C' }], n: 3, ew: false, cross: true },
];

describe('generation parity: priceCombinations === generateNFolds', () => {
  for (const c of cases) {
    it(c.name, () => {
      const ref = referenceGenerateNFolds(c.bets, c.n, c.ew, false, c.cross);
      const got = priceCombinations(toPriceable(c.bets), c.n, {
        eachWay: c.ew,
        isCompatible: c.cross ? allCompatible(sameEventIncompatible) : undefined,
      });
      expect(got.noOfCombinations).toBe(ref.noOfCombinations);
      expect(got.totalOdds).toBeCloseTo(ref.return, 6);
      expect(got.totalPlaceOdds).toBeCloseTo(ref.placeReturn, 6);
    });
  }
});
