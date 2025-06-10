import { isMarketRace, isMarketRaceV2 } from '../../../utils';

describe('isMarketRace (deprecated)', () => {
  it('should return true for valid race sport slugs', () => {
    expect(isMarketRace('golf')).toBe(true);
    expect(isMarketRace('motorsport')).toBe(true);
    expect(isMarketRace('politics')).toBe(true);
    expect(isMarketRace('cycling')).toBe(true);
    expect(isMarketRace('specials')).toBe(true);
  });

  it('should return false for non-race sport slugs', () => {
    expect(isMarketRace('football')).toBe(false);
    expect(isMarketRace('tennis')).toBe(false);
    expect(isMarketRace('')).toBe(false);
    expect(isMarketRace(null)).toBe(false);
  });
});

describe('isMarketRaceV2', () => {
  const raceMarketIds = new Set(['market-1', 'market-2', 'market-3']);

  it('should return true if marketId is in raceMarketIds', () => {
    expect(isMarketRaceV2('market-1', raceMarketIds)).toBe(true);
    expect(isMarketRaceV2('market-3', raceMarketIds)).toBe(true);
  });

  it('should return false if marketId is not in raceMarketIds', () => {
    expect(isMarketRaceV2('market-4', raceMarketIds)).toBe(false);
    expect(isMarketRaceV2('', raceMarketIds)).toBe(false);
  });
});
