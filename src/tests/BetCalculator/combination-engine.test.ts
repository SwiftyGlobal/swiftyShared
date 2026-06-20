import {
  generateCombinations,
  sameEventIncompatible,
  sameParticipantIncompatible,
  allCompatible,
  multiplyOdds,
  eachWayPlaceOdd,
  priceCombinations,
  CombinableLeg,
  PriceableLeg,
} from '../../BetCalculator/combination-engine';

describe('generateCombinations', () => {
  it('returns all C(n,k) when no predicate', () => {
    expect(generateCombinations([1, 2, 3, 4], 2).length).toBe(6);
    expect(generateCombinations([1, 2, 3, 4], 3).length).toBe(4);
  });
  it('returns [] when k > n', () => {
    expect(generateCombinations([1, 2], 3)).toEqual([]);
  });
  it('preserves order within each combination', () => {
    expect(generateCombinations([1, 2, 3], 2)).toEqual([[1, 2], [1, 3], [2, 3]]);
  });
  it('drops pairs the predicate rejects', () => {
    // reject combos containing two evens
    const isCompat = (a: number, b: number) => !(a % 2 === 0 && b % 2 === 0);
    expect(generateCombinations([2, 4, 1, 3], 2)).toBeDefined();
    const r = generateCombinations([2, 4, 1, 3], 2, isCompat);
    expect(r).not.toContainEqual([2, 4]);
    expect(r.length).toBe(5); // 6 total minus [2,4]
  });
});

describe('exclusion predicates', () => {
  // Cross example: A{A1,A2}, B{B1,B2}, C{C1}
  const legs: CombinableLeg[] = [
    { event_id: 'A' }, { event_id: 'A' },
    { event_id: 'B' }, { event_id: 'B' },
    { event_id: 'C' },
  ];
  const crossCompat = allCompatible(sameEventIncompatible);

  it('cross doubles = 8', () => {
    expect(generateCombinations(legs, 2, crossCompat).length).toBe(8);
  });
  it('cross trebles = 4', () => {
    expect(generateCombinations(legs, 3, crossCompat).length).toBe(4);
  });
  it('sameEventIncompatible ignores null event_id', () => {
    expect(sameEventIncompatible({}, {})).toBe(false);
  });
  it('sameParticipant only fires for darts with equal participant_id', () => {
    expect(sameParticipantIncompatible(
      { sport_slug: 'darts', participant_id: 7 }, { sport_slug: 'darts', participant_id: 7 })).toBe(true);
    expect(sameParticipantIncompatible(
      { sport_slug: 'darts', participant_id: 7 }, { sport_slug: 'darts', participant_id: 8 })).toBe(false);
    expect(sameParticipantIncompatible(
      { sport_slug: 'football', participant_id: 7 }, { sport_slug: 'football', participant_id: 7 })).toBe(false);
  });
  it('allCompatible composes (darts + cross both apply)', () => {
    const compat = allCompatible(sameEventIncompatible, sameParticipantIncompatible);
    const dartsLegs: CombinableLeg[] = [
      { event_id: 'A', sport_slug: 'darts', participant_id: 1 },
      { event_id: 'B', sport_slug: 'darts', participant_id: 1 }, // same participant -> excluded
      { event_id: 'C', sport_slug: 'darts', participant_id: 2 },
    ];
    const combos = generateCombinations(dartsLegs, 2, compat);
    expect(combos.length).toBe(2); // A-C, B-C ; A-B excluded by participant
  });
});

describe('odds primitives', () => {
  it('multiplyOdds multiplies decimals; empty = 1', () => {
    expect(multiplyOdds([2, 3])).toBe(6);
    expect(multiplyOdds([2, 1, 2])).toBe(4); // void leg passed as 1
    expect(multiplyOdds([])).toBe(1);
  });
  it('eachWayPlaceOdd applies the EW fraction', () => {
    // win odd 5.0 (4/1), terms 1/4 -> (5-1)*(1/4)+1 = 2
    expect(eachWayPlaceOdd(5, '1/4')).toBeCloseTo(2);
    // no slash -> term 1 -> place odd == win odd
    expect(eachWayPlaceOdd(5, '')).toBeCloseTo(5);
  });
});

describe('priceCombinations', () => {
  const odds2 = (n: number): PriceableLeg[] => Array.from({ length: n }, () => ({ odd: 2 }));

  it('plain doubles: 4 legs @2.0 -> 6 combos, totalOdds 24', () => {
    const r = priceCombinations(odds2(4), 2);
    expect(r.noOfCombinations).toBe(6);
    expect(r.totalOdds).toBe(24); // 6 * (2*2)
  });
  it('cross doubles via predicate: A{2}B{2}C{1} -> 8 combos', () => {
    const legs: PriceableLeg[] = [
      { odd: 2, event_id: 'A' }, { odd: 2, event_id: 'A' },
      { odd: 2, event_id: 'B' }, { odd: 2, event_id: 'B' },
      { odd: 2, event_id: 'C' },
    ];
    const r = priceCombinations(legs, 2, { isCompatible: allCompatible(sameEventIncompatible) });
    expect(r.noOfCombinations).toBe(8);
    expect(r.totalOdds).toBe(32); // 8 * 4
  });
  it('starting_price leg zeroes its combinations win odds', () => {
    const legs: PriceableLeg[] = [{ odd: 2 }, { odd: 3, starting_price: true }];
    const r = priceCombinations(legs, 2);
    expect(r.noOfCombinations).toBe(1);
    expect(r.totalOdds).toBe(0); // 2 * 0
  });
  it('each-way place odds summed when eachWay', () => {
    const legs: PriceableLeg[] = [{ odd: 5, ew_terms: '1/4' }, { odd: 5, ew_terms: '1/4' }];
    const r = priceCombinations(legs, 2, { eachWay: true });
    expect(r.totalOdds).toBe(25);        // 5*5
    expect(r.totalPlaceOdds).toBeCloseTo(4); // 2 * 2 (each place odd = 2)
  });
});
