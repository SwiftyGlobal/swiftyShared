import { calculateUpAndDownReturn, UpAndDownLeg } from '../../BetCalculator/upAndDown';

const leg = (over: Partial<UpAndDownLeg>): UpAndDownLeg => ({
  winOdds: 0,
  placeOdds: 0,
  won: false,
  placed: false,
  isVoid: false,
  deadHeatFraction: null,
  ...over,
});

const S = 10;

describe('Up-and-Down SSA (win-only), oA=3.0 oB=2.0, unit=10', () => {
  const A = (won: boolean) => leg({ winOdds: 3, won });
  const B = (won: boolean) => leg({ winOdds: 2, won });

  it('both win -> 80', () => {
    expect(calculateUpAndDownReturn('ssa', A(true), B(true), S, false)).toBeCloseTo(80, 6);
  });
  it('A win only -> 20', () => {
    expect(calculateUpAndDownReturn('ssa', A(true), B(false), S, false)).toBeCloseTo(20, 6);
  });
  it('B win only -> 10', () => {
    expect(calculateUpAndDownReturn('ssa', A(false), B(true), S, false)).toBeCloseTo(10, 6);
  });
  it('both lose -> 0', () => {
    expect(calculateUpAndDownReturn('ssa', A(false), B(false), S, false)).toBeCloseTo(0, 6);
  });
});

describe('Up-and-Down DSA (win-only), unit=10', () => {
  it('A@3.0 B@2.5 both win -> 125', () => {
    expect(
      calculateUpAndDownReturn('dsa', leg({ winOdds: 3, won: true }), leg({ winOdds: 2.5, won: true }), S, false),
    ).toBeCloseTo(125, 6);
  });
  it('A@1.5 (<= evens) B@3.0 both win -> 85', () => {
    expect(
      calculateUpAndDownReturn('dsa', leg({ winOdds: 1.5, won: true }), leg({ winOdds: 3, won: true }), S, false),
    ).toBeCloseTo(85, 6);
  });
  it('A@3.0 B@2.5 A win, B lose -> 10', () => {
    expect(
      calculateUpAndDownReturn('dsa', leg({ winOdds: 3, won: true }), leg({ winOdds: 2.5, won: false }), S, false),
    ).toBeCloseTo(10, 6);
  });
});

describe('Up-and-Down SSA each-way, A(win3/place2) B(win2/place1.5), unit=10', () => {
  const A = (won: boolean, placed: boolean) => leg({ winOdds: 3, placeOdds: 2, won, placed });
  const B = (won: boolean, placed: boolean) => leg({ winOdds: 2, placeOdds: 1.5, won, placed });

  it('all win (won & placed) -> 130 (win 80 + place 50)', () => {
    expect(calculateUpAndDownReturn('ssa', A(true, true), B(true, true), S, true)).toBeCloseTo(130, 6);
  });
  it('A win+placed, B placed-only -> 70 (win 20 + place 50)', () => {
    expect(calculateUpAndDownReturn('ssa', A(true, true), B(false, true), S, true)).toBeCloseTo(70, 6);
  });
  it('both placed-only -> 50 (win 0 + place 50)', () => {
    expect(calculateUpAndDownReturn('ssa', A(false, true), B(false, true), S, true)).toBeCloseTo(50, 6);
  });
  it('both lose -> 0', () => {
    expect(calculateUpAndDownReturn('ssa', A(false, false), B(false, false), S, true)).toBeCloseTo(0, 6);
  });
});

describe('Up-and-Down edge results (SSA win-only, unit=10)', () => {
  it('void leg returns stake + ATC proceeds: A void, B win@2 -> 40', () => {
    const A = leg({ isVoid: true });
    const B = leg({ winOdds: 2, won: true });
    expect(calculateUpAndDownReturn('ssa', A, B, S, false)).toBeCloseTo(40, 6);
  });

  it('dead-heat divides stake: A half-won@3 (f=0.5), B win@2 -> 50', () => {
    const A = leg({ winOdds: 3, won: true, deadHeatFraction: 0.5 });
    const B = leg({ winOdds: 2, won: true });
    expect(calculateUpAndDownReturn('ssa', A, B, S, false)).toBeCloseTo(50, 6);
  });
});

describe('Up-and-Down SSA each-way regression: won leg without explicit placed', () => {
  it('won leg is treated as placed: A(win@3,place@2,won:true,placed:false) B(win@2,place@1.5,won:true,placed:false) -> 130', () => {
    const A = leg({ winOdds: 3, placeOdds: 2, won: true, placed: false });
    const B = leg({ winOdds: 2, placeOdds: 1.5, won: true, placed: false });
    expect(calculateUpAndDownReturn('ssa', A, B, S, true)).toBeCloseTo(130, 6);
  });
});
