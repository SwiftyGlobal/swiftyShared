import { checkIsCountryAllowed } from '../../utils';

describe('checkIsCountryAllowed', () => {
  it('returns true when countries array is null', () => {
    expect(checkIsCountryAllowed(null, 'GB')).toBe(true);
  });

  it('returns true when countries array is empty', () => {
    expect(checkIsCountryAllowed([], 'GB')).toBe(true);
  });

  it('returns true when countryCode is "all"', () => {
    expect(checkIsCountryAllowed(['GB', 'DE'], 'all')).toBe(true);
  });

  it('returns true when countryCode is in the countries array', () => {
    expect(checkIsCountryAllowed(['GB', 'DE'], 'GB')).toBe(true);
  });

  it('returns false when countryCode is not in the countries array', () => {
    expect(checkIsCountryAllowed(['GB', 'DE'], 'US')).toBe(false);
  });

  it('returns true when countryCode is in the countries array regardless of case', () => {
    expect(checkIsCountryAllowed(['GB', 'DE'], 'gb')).toBe(true);
  });
});
