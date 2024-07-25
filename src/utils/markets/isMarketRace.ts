/**
 * @deprecated - Deprecated since the sport condition is wrong. Do not use anymore!
 */
export const isMarketRace = (sportSlug: string | null): boolean => {
  if (!sportSlug) return false;

  const sports = ['golf', 'motorsport', 'politics', 'cycling', 'specials'];

  if (sports.includes(sportSlug || '')) {
    return true;
  }

  return false;
};

/**
 * @description - New function to check if the market is race-type. Replace of the old function **`isMarketRace`**
 */
export const isMarketRaceV2 = (marketId: string, raceMarketIds: Set<string>): boolean => {
  return raceMarketIds.has(marketId);
};
