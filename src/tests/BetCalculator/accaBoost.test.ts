import type { AccaBoostConfig, BoostLeg } from '../../BetCalculator/accaBoost';
import {
  resolveAccaTier,
  effectiveBetTypeKey,
  betTypeKeyToFold,
  hasAnyVoidLeg,
  countEffectiveFold,
  parseRulesSnapshot,
} from '../../BetCalculator/accaBoost';

// Trello [5063]: Acca boost tier must reflect EFFECTIVE fold after voids.
// A 7-fold placed at 15% with 2 voids → 5-fold tier → 10%.

const sevenTierConfig: AccaBoostConfig = {
  enabled: true,
  max_award: 1000,
  bet_types: [
    { bet_type: 'fold5', percentage_boost: 10 },
    { bet_type: 'fold6', percentage_boost: 12 },
    { bet_type: 'fold7', percentage_boost: 15 },
  ],
};

function legs({
  winners = 0,
  losers = 0,
  voids = 0,
}: { winners?: number; losers?: number; voids?: number } = {}): BoostLeg[] {
  const out: BoostLeg[] = [];
  for (let i = 0; i < winners; i++) out.push({ result: 'winner' });
  for (let i = 0; i < losers; i++) out.push({ result: 'loser' });
  for (let i = 0; i < voids; i++) out.push({ result: 'void' });
  return out;
}

describe('effectiveBetTypeKey - fold → bet_type key', () => {
  it("maps 2 to 'double'", () => expect(effectiveBetTypeKey(2)).toBe('double'));
  it("maps 3 to 'treble'", () => expect(effectiveBetTypeKey(3)).toBe('treble'));
  it("maps 4 to 'fold4'", () => expect(effectiveBetTypeKey(4)).toBe('fold4'));
  it("maps 7 to 'fold7'", () => expect(effectiveBetTypeKey(7)).toBe('fold7'));
  it('returns null for fold < 2', () => {
    expect(effectiveBetTypeKey(1)).toBeNull();
    expect(effectiveBetTypeKey(0)).toBeNull();
  });
  it('returns null for non-numeric input', () => {
    expect(effectiveBetTypeKey(NaN)).toBeNull();
  });
});

describe('betTypeKeyToFold - inverse mapping', () => {
  it("'double' → 2", () => expect(betTypeKeyToFold('double')).toBe(2));
  it("'treble' → 3", () => expect(betTypeKeyToFold('treble')).toBe(3));
  it("'fold7' → 7", () => expect(betTypeKeyToFold('fold7')).toBe(7));
  it('returns null for unknown keys', () => expect(betTypeKeyToFold('quadruple')).toBeNull());
});

describe('hasAnyVoidLeg', () => {
  it('detects void', () => expect(hasAnyVoidLeg(legs({ winners: 4, voids: 1 }))).toBe(true));
  it('detects pushed', () => expect(hasAnyVoidLeg([{ result: 'winner' }, { result: 'pushed' }])).toBe(true));
  it('false for all winners', () => expect(hasAnyVoidLeg(legs({ winners: 5 }))).toBe(false));
  it('false for empty / null', () => {
    expect(hasAnyVoidLeg([])).toBe(false);
    expect(hasAnyVoidLeg(null)).toBe(false);
    expect(hasAnyVoidLeg(undefined)).toBe(false);
  });
});

describe('countEffectiveFold', () => {
  it('counts winners + losers + half_won + half_lost', () => {
    const arr: BoostLeg[] = [
      { result: 'winner' },
      { result: 'winner' },
      { result: 'loser' },
      { result: 'half_won' },
      { result: 'half_lost' },
      { result: 'void' },
      { result: 'pushed' },
    ];
    expect(countEffectiveFold(arr)).toBe(5);
  });
  it('returns 0 for empty / null', () => {
    expect(countEffectiveFold([])).toBe(0);
    expect(countEffectiveFold(null)).toBe(0);
  });
});

describe('parseRulesSnapshot', () => {
  it('returns null for null/undefined/empty', () => {
    expect(parseRulesSnapshot(null)).toBeNull();
    expect(parseRulesSnapshot(undefined)).toBeNull();
    expect(parseRulesSnapshot('')).toBeNull();
  });
  it('passes through an object', () => {
    const obj = { percentage_boost: 5, max_award: 100 };
    expect(parseRulesSnapshot(obj)).toBe(obj);
  });
  it('parses a JSON string', () => {
    const obj = { percentage_boost: 5, max_award: 100 };
    expect(parseRulesSnapshot(JSON.stringify(obj))).toEqual(obj);
  });
  it('returns null on malformed JSON', () => {
    expect(parseRulesSnapshot('{not-json')).toBeNull();
  });
  it('returns null when JSON parses to a primitive', () => {
    expect(parseRulesSnapshot('42')).toBeNull();
    expect(parseRulesSnapshot('"foo"')).toBeNull();
  });
});

describe('resolveAccaTier - no-void path (placement tier kept)', () => {
  it('snapshot present, no voids → keep snapshot %', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 7 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier).toEqual({ percentage: 15, max_award: 1000, effective_fold: null });
  });

  it('snapshot still wins over live tier in all-win path', () => {
    // Snapshot 8% even though live fold7 is 15% — placement promise wins.
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 7 }),
      snapshot: { percentage_boost: 8, max_award: 1000 },
    });
    expect(tier!.percentage).toBe(8);
    expect(tier!.effective_fold).toBeNull();
  });

  it('legacy bet (no snapshot), no voids → live config matched by placement bet_type', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 6 }),
      snapshot: null,
      placementBetType: 'fold6',
    });
    expect(tier!.percentage).toBe(12);
    expect(tier!.effective_fold).toBeNull();
  });

  it('legacy bet, no voids, no placementBetType → null', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 6 }),
      snapshot: null,
    });
    expect(tier).toBeNull();
  });

  it('legacy bet, no voids, placement tier not in config → null', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 4 }),
      snapshot: null,
      placementBetType: 'fold4',
    });
    expect(tier).toBeNull();
  });

  it('snapshot max_award wins over live max_award (no voids)', () => {
    const cfg: AccaBoostConfig = { ...sevenTierConfig, max_award: 100 };
    const tier = resolveAccaTier({
      config: cfg,
      bets: legs({ winners: 7 }),
      snapshot: { percentage_boost: 15, max_award: 5000 },
    });
    expect(tier!.max_award).toBe(5000);
  });

  it('uses live max_award when snapshot has no cap (no voids)', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 7 }),
      snapshot: { percentage_boost: 15 },
    });
    expect(tier!.max_award).toBe(1000);
  });
});

describe('resolveAccaTier - void-aware tier recompute', () => {
  it('7-fold placed at 15%, 2 voids → effective 5-fold (10%, per Trello example)', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 5, voids: 2 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.percentage).toBe(10);
    expect(tier!.effective_fold).toBe(5);
  });

  it('losers count toward effective fold', () => {
    // 5 winners + 1 loser + 1 void → effective fold = 6 (winners+losers) → fold6 (12%)
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 5, losers: 1, voids: 1 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.percentage).toBe(12);
    expect(tier!.effective_fold).toBe(6);
  });

  it('treats half_won/half_lost as graded legs', () => {
    const arr: BoostLeg[] = [
      { result: 'winner' },
      { result: 'winner' },
      { result: 'winner' },
      { result: 'winner' },
      { result: 'half_won' },
      { result: 'half_lost' },
      { result: 'void' },
    ];
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: arr,
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.effective_fold).toBe(6);
    expect(tier!.percentage).toBe(12);
  });

  it('below-table floor: 3 voids → effective 4-fold → applies lowest tier (fold5, 10%)', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ winners: 4, voids: 3 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.percentage).toBe(10);
    expect(tier!.effective_fold).toBe(4);
  });

  it('no live tiers but has snapshot + voids → replays snapshot percentage', () => {
    const tier = resolveAccaTier({
      config: { ...sevenTierConfig, bet_types: [] },
      bets: legs({ winners: 5, voids: 2 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.percentage).toBe(15);
    expect(tier!.max_award).toBe(1000);
  });

  it('config disabled + voids → falls back to snapshot', () => {
    const tier = resolveAccaTier({
      config: { ...sevenTierConfig, enabled: false },
      bets: legs({ winners: 5, voids: 2 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.percentage).toBe(15);
  });

  it('voids but no snapshot + no live tiers → null', () => {
    const tier = resolveAccaTier({
      config: { ...sevenTierConfig, bet_types: [] },
      bets: legs({ winners: 5, voids: 2 }),
      snapshot: null,
    });
    expect(tier).toBeNull();
  });

  it('all legs void → effective fold 0 → applies floor (lowest tier)', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: legs({ voids: 7 }),
      snapshot: { percentage_boost: 15, max_award: 1000 },
    });
    expect(tier!.effective_fold).toBe(0);
    expect(tier!.percentage).toBe(10); // floor
  });

  it('snapshot caps recompute (defensive): snapshot 8%, table tier 15% → 8%', () => {
    const tier = resolveAccaTier({
      config: sevenTierConfig,
      bets: [
        { result: 'winner' },
        { result: 'winner' },
        { result: 'winner' },
        { result: 'winner' },
        { result: 'winner' },
        { result: 'winner' },
        { result: 'void' },
      ],
      snapshot: { percentage_boost: 8, max_award: 1000 },
    });
    // Effective fold = 6 → live tier 12%, but snapshot caps at 8%.
    expect(tier!.percentage).toBe(8);
  });
});
