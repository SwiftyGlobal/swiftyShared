import type { LuckyBoostConfig } from '../../BetCalculator/luckyBoost';
import {
  calculateLuckyBoost,
  parseBoostValue,
  isLuckyBetType,
  cleanLuckyBetType,
  LUCKY_TOTAL_LINES,
  LUCKY_TOTAL_SELECTIONS,
} from '../../BetCalculator/luckyBoost';
import type { BoostLeg } from '../../BetCalculator/accaBoost';

describe('parseBoostValue', () => {
  it("'double' / 'treble'", () => {
    expect(parseBoostValue('double')).toEqual({ kind: 'double' });
    expect(parseBoostValue('treble')).toEqual({ kind: 'treble' });
    expect(parseBoostValue('Double')).toEqual({ kind: 'double' }); // case-insensitive
  });
  it('percent forms', () => {
    expect(parseBoostValue('5')).toEqual({ kind: 'percent', percent: 5 });
    expect(parseBoostValue('5%')).toEqual({ kind: 'percent', percent: 5 });
    expect(parseBoostValue(5)).toEqual({ kind: 'percent', percent: 5 });
    expect(parseBoostValue('5.5%')).toEqual({ kind: 'percent', percent: 5.5 });
  });
  it('none / empty / null', () => {
    expect(parseBoostValue('none')).toEqual({ kind: 'none' });
    expect(parseBoostValue('')).toEqual({ kind: 'none' });
    expect(parseBoostValue(null)).toEqual({ kind: 'none' });
    expect(parseBoostValue(undefined)).toEqual({ kind: 'none' });
    expect(parseBoostValue('0')).toEqual({ kind: 'none' });
    expect(parseBoostValue('abc')).toEqual({ kind: 'none' });
  });
});

describe('isLuckyBetType / cleanLuckyBetType', () => {
  it('accepts both prefixed and unprefixed slugs', () => {
    expect(isLuckyBetType('lucky15')).toBe(true);
    expect(isLuckyBetType('lucky31')).toBe(true);
    expect(isLuckyBetType('lucky63')).toBe(true);
    expect(isLuckyBetType('bet_slip_place_lucky15')).toBe(true);
    expect(isLuckyBetType('bet_slip_place_lucky63')).toBe(true);
  });
  it('rejects others', () => {
    expect(isLuckyBetType('fold5')).toBe(false);
    expect(isLuckyBetType('double')).toBe(false);
    expect(isLuckyBetType('')).toBe(false);
    expect(isLuckyBetType(null)).toBe(false);
  });
  it('cleanLuckyBetType strips prefix', () => {
    expect(cleanLuckyBetType('bet_slip_place_lucky15')).toBe('lucky15');
    expect(cleanLuckyBetType('lucky15')).toBe('lucky15');
    expect(cleanLuckyBetType(null)).toBe('');
  });
});

describe('LUCKY_* maps', () => {
  it('total lines and selections', () => {
    expect(LUCKY_TOTAL_LINES).toEqual({ lucky15: 15, lucky31: 31, lucky63: 63 });
    expect(LUCKY_TOTAL_SELECTIONS).toEqual({ lucky15: 4, lucky31: 5, lucky63: 6 });
  });
});

const baseLuckyConfig = (): LuckyBoostConfig => ({
  enabled: true,
  config: {
    lucky15: {
      one_winner: 'double',
      all_winners: '5',
      eligible_sports: ['horseracing', 'greyhoundracing'],
    },
  },
});

function legs(
  arr: Array<Partial<BoostLeg> & { result: string; odd?: number; sport_slug?: string; rule_4?: number }>,
): BoostLeg[] {
  return arr.map((l) => ({ sport_slug: 'horseracing', ...l }));
}

describe('calculateLuckyBoost — basic gates', () => {
  it('returns empty when config disabled', () => {
    const r = calculateLuckyBoost({
      config: { ...baseLuckyConfig(), enabled: false },
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 100,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      eligible_sports: undefined,
      max_award: 100,
    });
    expect(r.amount).toBe(0);
    expect(r.type).toBeNull();
  });

  it('returns empty for non-lucky bet_type', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'fold5',
      stake_per_line: 1,
      return_amount: 100,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner' })),
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });

  it('void leg disqualifies', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 100,
      resultedSingleBets: legs([
        { result: 'winner', odd: 2 },
        { result: 'winner', odd: 2 },
        { result: 'winner', odd: 2 },
        { result: 'void', odd: 1 },
      ]),
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });

  it('explicit empty eligible_sports disables boost', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 100,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      eligible_sports: [], // disabled
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });

  it('sport_slug not in eligible_sports → disqualified', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 100,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2, sport_slug: 'football' })),
      eligible_sports: ['horseracing'],
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });

  it('undefined eligible_sports → no gate (legacy path)', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 70,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2, sport_slug: 'football' })),
      eligible_sports: undefined,
      max_award: 100,
    });
    // 4 winners + lucky15 → all_winners 5% branch. totalStake = 1×15 = 15;
    // winnings = 70 - 15 = 55; 5% = 2.75.
    expect(r.type).toBe('all_winners');
    expect(r.amount).toBeCloseTo(2.75, 4);
  });

  it('max_award ≤ 0 disables', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 100,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      max_award: 0,
    });
    expect(r.amount).toBe(0);
  });
});

describe('calculateLuckyBoost — all-winners branch', () => {
  it('lucky15 all win @ 5% all_winners', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 70,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      max_award: 100,
    });
    expect(r.type).toBe('all_winners');
    // winnings = 70 - 15 = 55 → 5% = 2.75
    expect(r.amount).toBeCloseTo(2.75, 4);
  });

  it('accepts bet_slip_place_ prefix', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'bet_slip_place_lucky15',
      stake_per_line: 1,
      return_amount: 70,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      max_award: 100,
    });
    expect(r.amount).toBeCloseTo(2.75, 4);
  });

  it('all_winners = "none" → no bonus even if all win', () => {
    const cfg = baseLuckyConfig();
    cfg.config.lucky15!.all_winners = 'none';
    const r = calculateLuckyBoost({
      config: cfg,
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 70,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });

  it('caps at max_award', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 10,
      return_amount: 10000,
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 5 })),
      max_award: 50,
    });
    expect(r.amount).toBe(50);
  });

  it('winnings ≤ 0 → no boost', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 15, // stake equals payout
      resultedSingleBets: legs(Array(4).fill({ result: 'winner', odd: 2 })),
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });
});

describe('calculateLuckyBoost — one-winner branch', () => {
  it('double on £5 @ 3.00 → bonus £10', () => {
    // (3 - 1) × 5 = 10
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 5,
      return_amount: 15,
      resultedSingleBets: legs([
        { result: 'winner', odd: 3 },
        { result: 'loser' },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 100,
    });
    expect(r.type).toBe('one_winner');
    expect(r.amount).toBeCloseTo(10, 4);
  });

  it('treble on £5 @ 3.00 → bonus £20', () => {
    const cfg = baseLuckyConfig();
    cfg.config.lucky15!.one_winner = 'treble';
    const r = calculateLuckyBoost({
      config: cfg,
      bet_type: 'lucky15',
      stake_per_line: 5,
      return_amount: 15,
      resultedSingleBets: legs([
        { result: 'winner', odd: 3 },
        { result: 'loser' },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 100,
    });
    expect(r.amount).toBeCloseTo(20, 4);
  });

  it('percent (10%) on £5 @ 3.00 → bonus £1', () => {
    const cfg = baseLuckyConfig();
    cfg.config.lucky15!.one_winner = '10%';
    const r = calculateLuckyBoost({
      config: cfg,
      bet_type: 'lucky15',
      stake_per_line: 5,
      return_amount: 15,
      resultedSingleBets: legs([
        { result: 'winner', odd: 3 },
        { result: 'loser' },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 100,
    });
    expect(r.amount).toBeCloseTo(1, 4);
  });

  it('R4-adjusts the odd before computing bonus', () => {
    // odd 3.0 with R4 50% → adjusted = 1 + (3-1) × 0.5 = 2.0
    // double on stake 5: (2 - 1) × 5 = 5
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 5,
      return_amount: 10,
      resultedSingleBets: legs([
        { result: 'winner', odd: 3, rule_4: 50 },
        { result: 'loser' },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 100,
    });
    expect(r.amount).toBeCloseTo(5, 4);
  });

  it('one_winner = "none" → no bonus', () => {
    const cfg = baseLuckyConfig();
    cfg.config.lucky15!.one_winner = 'none';
    const r = calculateLuckyBoost({
      config: cfg,
      bet_type: 'lucky15',
      stake_per_line: 5,
      return_amount: 15,
      resultedSingleBets: legs([
        { result: 'winner', odd: 3 },
        { result: 'loser' },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });

  it('caps one-winner at max_award', () => {
    // (10 - 1) × 100 = 900 → capped at 50
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 100,
      return_amount: 1000,
      resultedSingleBets: legs([
        { result: 'winner', odd: 10 },
        { result: 'loser' },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 50,
    });
    expect(r.amount).toBe(50);
  });
});

describe('calculateLuckyBoost — half_won/half_lost count as winners (worker parity)', () => {
  it('3 winners + 1 half_won → counts as 4 winners → all-winners branch fires', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 70,
      resultedSingleBets: legs([
        { result: 'winner', odd: 2 },
        { result: 'winner', odd: 2 },
        { result: 'winner', odd: 2 },
        { result: 'half_won', odd: 2 },
      ]),
      max_award: 100,
    });
    expect(r.type).toBe('all_winners');
  });
});

describe('calculateLuckyBoost — neither branch fires', () => {
  it('2 winners + 2 losers → no consolation, no all-win', () => {
    const r = calculateLuckyBoost({
      config: baseLuckyConfig(),
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 5,
      resultedSingleBets: legs([
        { result: 'winner', odd: 2 },
        { result: 'winner', odd: 2 },
        { result: 'loser' },
        { result: 'loser' },
      ]),
      max_award: 100,
    });
    expect(r.amount).toBe(0);
  });
});

describe('calculateLuckyBoost — include_bog toggle', () => {
  const allWinConfig = {
    enabled: true,
    config: { lucky15: { one_winner: 'none', all_winners: '10%' } },
  };
  const fourWinners = [
    { result: 'winner', sport_slug: 'horseracing', odd: 2 },
    { result: 'winner', sport_slug: 'horseracing', odd: 2 },
    { result: 'winner', sport_slug: 'horseracing', odd: 2 },
    { result: 'winner', sport_slug: 'horseracing', odd: 2 },
  ];

  it('all-winners: include_bog=true uses BOG return_amount', () => {
    const r = calculateLuckyBoost({
      config: allWinConfig as any,
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 200,
      return_amount_no_bog: 150,
      resultedSingleBets: fourWinners as any,
      eligible_sports: ['horseracing'],
      max_award: 1000,
      include_bog: true,
    } as any);
    expect(r.amount).toBeCloseTo(18.5, 2); // (200 - 15) * 10%
    expect(r.type).toBe('all_winners');
  });

  it('all-winners: include_bog=false uses placed return_amount_no_bog', () => {
    const r = calculateLuckyBoost({
      config: allWinConfig as any,
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 200,
      return_amount_no_bog: 150,
      resultedSingleBets: fourWinners as any,
      eligible_sports: ['horseracing'],
      max_award: 1000,
      include_bog: false,
    } as any);
    expect(r.amount).toBeCloseTo(13.5, 2); // (150 - 15) * 10%
  });

  it('all-winners: omitting return_amount_no_bog falls back to return_amount (back-compat)', () => {
    const r = calculateLuckyBoost({
      config: allWinConfig as any,
      bet_type: 'lucky15',
      stake_per_line: 1,
      return_amount: 200,
      resultedSingleBets: fourWinners as any,
      eligible_sports: ['horseracing'],
      max_award: 1000,
    } as any);
    expect(r.amount).toBeCloseTo(18.5, 2);
  });

  const oneWinConfig = {
    enabled: true,
    config: { lucky15: { one_winner: 'double', all_winners: 'none' } },
  };
  const oneWinnerLegs = [
    { result: 'winner', sport_slug: 'horseracing', odd_decimal: 3, odd: 3, rule_4: 0, bog_odd: 5 },
    { result: 'loser', sport_slug: 'horseracing', odd: 2 },
    { result: 'loser', sport_slug: 'horseracing', odd: 2 },
    { result: 'loser', sport_slug: 'horseracing', odd: 2 },
  ];

  it('one-winner: include_bog=true uses bog_odd as-is', () => {
    const r = calculateLuckyBoost({
      config: oneWinConfig as any,
      bet_type: 'lucky15',
      stake_per_line: 2,
      return_amount: 0,
      return_amount_no_bog: 0,
      resultedSingleBets: oneWinnerLegs as any,
      eligible_sports: ['horseracing'],
      max_award: 1000,
      include_bog: true,
    } as any);
    expect(r.amount).toBeCloseTo(8, 2); // (5 - 1) * 2
    expect(r.type).toBe('one_winner');
  });

  it('one-winner: include_bog=false uses placed odd', () => {
    const r = calculateLuckyBoost({
      config: oneWinConfig as any,
      bet_type: 'lucky15',
      stake_per_line: 2,
      return_amount: 0,
      return_amount_no_bog: 0,
      resultedSingleBets: oneWinnerLegs as any,
      eligible_sports: ['horseracing'],
      max_award: 1000,
      include_bog: false,
    } as any);
    expect(r.amount).toBeCloseTo(4, 2); // (3 - 1) * 2
  });

  it('one-winner: include_bog=true but bog_odd missing falls back to placed odd', () => {
    const legsNoBog = oneWinnerLegs.map((l) => { const { bog_odd, ...rest } = l; return rest; });
    const r = calculateLuckyBoost({
      config: oneWinConfig as any,
      bet_type: 'lucky15',
      stake_per_line: 2,
      return_amount: 0,
      return_amount_no_bog: 0,
      resultedSingleBets: legsNoBog as any,
      eligible_sports: ['horseracing'],
      max_award: 1000,
      include_bog: true,
    } as any);
    expect(r.amount).toBeCloseTo(4, 2);
  });
});
