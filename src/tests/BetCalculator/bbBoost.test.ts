import type { BBBoostConfig } from '../../BetCalculator/bbBoost';
import { calculateBBBoost } from '../../BetCalculator/bbBoost';
import type { BoostLeg } from '../../BetCalculator/accaBoost';

function winners(n: number): BoostLeg[] {
  return Array.from({ length: n }, () => ({ result: 'winner' }));
}

const liveConfig: BBBoostConfig = {
  enabled: true,
  max_award: 100,
  selections: [
    { selections: '2', percentage_boost: 5 },
    { selections: '3', percentage_boost: 10 },
    { selections: '4', percentage_boost: 15 },
  ],
};

describe('calculateBBBoost', () => {
  it('returns 0 when no legs', () => {
    expect(calculateBBBoost({ return_amount: 100, stake: 10, resultedSingleBets: [], config: liveConfig })).toBe(0);
  });

  it('returns 0 if any leg is not a clean winner', () => {
    const legs: BoostLeg[] = [{ result: 'winner' }, { result: 'void' }];
    expect(calculateBBBoost({ return_amount: 100, stake: 10, resultedSingleBets: legs, config: liveConfig })).toBe(0);

    const legs2: BoostLeg[] = [{ result: 'winner' }, { result: 'half_won' }];
    expect(calculateBBBoost({ return_amount: 100, stake: 10, resultedSingleBets: legs2, config: liveConfig })).toBe(0);

    const legs3: BoostLeg[] = [{ result: 'winner' }, { result: 'pushed' }];
    expect(calculateBBBoost({ return_amount: 100, stake: 10, resultedSingleBets: legs3, config: liveConfig })).toBe(0);
  });

  it('returns 0 when winnings ≤ 0', () => {
    expect(calculateBBBoost({ return_amount: 10, stake: 10, resultedSingleBets: winners(2), config: liveConfig })).toBe(
      0,
    );
  });

  it('uses snapshot percentage when present (preferred over live)', () => {
    // snapshot 7% wins over live tier (5% for 2 selections).
    const result = calculateBBBoost({
      return_amount: 110,
      stake: 10,
      resultedSingleBets: winners(2),
      snapshot: { percentage_boost: 7, max_award: 100 },
      config: liveConfig,
    });
    // winnings = 100, 7% = 7.00
    expect(result).toBeCloseTo(7.0, 4);
  });

  it('parses snapshot if passed as JSON string', () => {
    const result = calculateBBBoost({
      return_amount: 110,
      stake: 10,
      resultedSingleBets: winners(2),
      snapshot: JSON.stringify({ percentage_boost: 7, max_award: 100 }),
      config: liveConfig,
    });
    expect(result).toBeCloseTo(7.0, 4);
  });

  it('falls back to live config matched by selections count', () => {
    const result = calculateBBBoost({
      return_amount: 110,
      stake: 10,
      resultedSingleBets: winners(3),
      snapshot: null,
      config: liveConfig,
    });
    // 3 selections → 10% of 100 = 10
    expect(result).toBeCloseTo(10.0, 4);
  });

  it('caps at snapshot max_award', () => {
    const result = calculateBBBoost({
      return_amount: 1000,
      stake: 10,
      resultedSingleBets: winners(2),
      snapshot: { percentage_boost: 50, max_award: 5 },
    });
    // raw boost would be 495, capped at 5.
    expect(result).toBe(5);
  });

  it('caps at live config max_award when no snapshot', () => {
    const result = calculateBBBoost({
      return_amount: 1000,
      stake: 10,
      resultedSingleBets: winners(2),
      snapshot: null,
      config: { ...liveConfig, max_award: 3 },
    });
    expect(result).toBe(3);
  });

  it('no boost when neither snapshot nor matching live tier', () => {
    expect(
      calculateBBBoost({
        return_amount: 100,
        stake: 10,
        resultedSingleBets: winners(7), // no tier for 7
        snapshot: null,
        config: liveConfig,
      }),
    ).toBe(0);
  });

  it('config disabled → 0', () => {
    expect(
      calculateBBBoost({
        return_amount: 100,
        stake: 10,
        resultedSingleBets: winners(2),
        snapshot: null,
        config: { ...liveConfig, enabled: false },
      }),
    ).toBe(0);
  });

  it('rounds to cents', () => {
    const result = calculateBBBoost({
      return_amount: 33.33,
      stake: 10,
      resultedSingleBets: winners(2),
      snapshot: { percentage_boost: 7 },
    });
    // winnings = 23.33, 7% = 1.6331 → rounded to 1.63
    expect(result).toBe(1.63);
  });
});
