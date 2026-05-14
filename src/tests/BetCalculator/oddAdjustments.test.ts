import { oddAfterRule4, spOddAfterRule4 } from '../../BetCalculator/oddAdjustments';

describe('oddAfterRule4', () => {
  it('returns 0 for non-positive odd', () => {
    expect(oddAfterRule4({ odd: 0, rule4_percentage: 25 })).toBe(0);
    expect(oddAfterRule4({ odd: -1, rule4_percentage: 25 })).toBe(0);
    expect(oddAfterRule4({ odd: '0', rule4_percentage: 25 })).toBe(0);
  });

  it('returns odd unchanged when r4 ≤ 0', () => {
    expect(oddAfterRule4({ odd: 3.5, rule4_percentage: 0 })).toBe(3.5);
    expect(oddAfterRule4({ odd: 3.5, rule4_percentage: null })).toBe(3.5);
    expect(oddAfterRule4({ odd: 3.5, rule4_percentage: undefined })).toBe(3.5);
    expect(oddAfterRule4({ odd: 3.5, rule4_percentage: -10 })).toBe(3.5);
  });

  it('applies the canonical formula', () => {
    // 1 + (3 - 1) × (1 - 25/100) = 1 + 2 × 0.75 = 2.5
    expect(oddAfterRule4({ odd: 3, rule4_percentage: 25 })).toBe(2.5);
    // 1 + (5 - 1) × (1 - 50/100) = 1 + 4 × 0.5 = 3
    expect(oddAfterRule4({ odd: 5, rule4_percentage: 50 })).toBe(3);
  });

  it('handles string inputs', () => {
    expect(oddAfterRule4({ odd: '3', rule4_percentage: '25' })).toBe(2.5);
  });
});

describe('spOddAfterRule4', () => {
  it('uses rule4_bog_odd when supplied (non-zero)', () => {
    // rule4_bog_odd wins regardless of starting_price_odd / rule4_percentage.
    expect(spOddAfterRule4({ starting_price_odd: 5, rule4_percentage: 50, rule4_bog_odd: 2.4 })).toBe(2.4);
  });

  it('falls through to oddAfterRule4 when rule4_bog_odd is 0 / missing', () => {
    expect(spOddAfterRule4({ starting_price_odd: 3, rule4_percentage: 25, rule4_bog_odd: 0 })).toBe(2.5);
    expect(spOddAfterRule4({ starting_price_odd: 3, rule4_percentage: 25 })).toBe(2.5);
  });
});
