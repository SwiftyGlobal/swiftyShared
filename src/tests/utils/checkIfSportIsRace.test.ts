import { checkIfSportIsRace } from '../../utils';

describe('checkIfSportIsRace', () => {
  it('returns true for a sport in the raceSports set', () => {
    expect(checkIfSportIsRace('horseracing')).toBe(true);
    expect(checkIfSportIsRace('greyhoundracing')).toBe(true);
    expect(checkIfSportIsRace('racing')).toBe(true);
  });

  it('returns false for a sport not in the raceSports set', () => {
    expect(checkIfSportIsRace('football')).toBe(false);
    expect(checkIfSportIsRace('basketball')).toBe(false);
    expect(checkIfSportIsRace('tennis')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(checkIfSportIsRace('')).toBe(false);
  });

  it('returns false for a sport with different casing', () => {
    expect(checkIfSportIsRace('HorseRacing')).toBe(false);
    expect(checkIfSportIsRace('GREYHOUNDRACING')).toBe(false);
    expect(checkIfSportIsRace('RACING')).toBe(false);
  });

  it('returns false for a sport with leading or trailing spaces', () => {
    expect(checkIfSportIsRace(' horseracing')).toBe(false);
    expect(checkIfSportIsRace('greyhoundracing ')).toBe(false);
    expect(checkIfSportIsRace(' racing ')).toBe(false);
  });
});
