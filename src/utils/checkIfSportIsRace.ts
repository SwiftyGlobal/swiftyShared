export const raceSports = new Set(['horseracing', 'greyhoundracing', 'racing']);

/**
 * @description Check if the given sport slug is a race sport.
 * @example
 * checkIfSportIsRace('horseracing'); // true
 * checkIfSportIsRace('football'); // false
 * @param {string} sportSlug - The slug of the sport to check.
 * @return {boolean} - Returns true if the sport is a race sport, otherwise false.
 */
export const checkIfSportIsRace = (sportSlug: string): boolean => {
  return raceSports.has(sportSlug);
};
