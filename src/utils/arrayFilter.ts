import type { Nullable } from '../types';

/**
 * @description Check if the country is allowed
 * @example
 * isCountryAllowed(['GB', 'DE'], 'GB') // true
 * isCountryAllowed(['GB', 'DE'], 'US') // false
 * isCountryAllowed(['GB', 'DE'], 'all') // true
 * isCountryAllowed(null, 'GB') // true
 */
export const checkIsCountryAllowed = (countries: Nullable<string[]>, countryCode: string) => {
  if (!countries?.length) return true;

  if (countryCode === 'all') return true;

  return countries.includes(countryCode.toUpperCase());
};
