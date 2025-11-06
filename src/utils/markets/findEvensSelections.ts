import type { OddsFormatsModel } from '../../models';

/**
 * Finds the "Evens" market (spread) from a list of selections.
 *
 * This function works by grouping selections by their 'handicap' value.
 * It then iterates over these groups, looking for pairs of selections
 *
 * It finds the pair with the smallest absolute price gap between them.
 *
 * @param selections - An array of all market selections.
 * @returns An array containing the two selections [PageLayoutSelectionModel, PageLayoutSelectionModel]
 * that form the "Evens" market. Returns an empty array
 * if no complete pair is found.
 */
export const findEvensSelections = <T extends { handicap: string; outcome_id: string } & OddsFormatsModel>(
  selections: T[],
): T[] => {
  // 1. Group selections by handicap
  // We now store selections in an array for each handicap line.
  const marketLines = new Map<string, T[]>();

  for (const selection of selections) {
    const handicap = selection.handicap;

    if (!handicap) {
      continue; // Skip selections without a handicap
    }

    // Ensure the handicap line exists in our map
    if (!marketLines.has(handicap)) {
      marketLines.set(handicap, []);
    }

    // Add the current selection to its handicap group
    marketLines.get(handicap)!.push(selection);
  }

  // 2. Find the smallest gap
  let smallestGap = Infinity;
  let bestPair: T[] = [];

  // Loop through all the grouped handicap lines (which are now arrays)
  for (const line of marketLines.values()) {
    // A valid pair must consist of exactly two selections (e.g., Over and Under)
    // and they must have different outcome_ids.
    if (line.length === 2 && line[0].outcome_id !== line[1].outcome_id) {
      // Get the two selections for this line
      const selectionOne = line[0];
      const selectionTwo = line[1];

      // Convert decimal odds from string to number for calculation
      const priceOne = parseFloat(selectionOne.odds_decimal);
      const priceTwo = parseFloat(selectionTwo.odds_decimal);

      // Calculate the absolute difference (the gap)
      const currentGap = Math.abs(priceOne - priceTwo);

      // 3. Compare and store the best pair
      if (currentGap < smallestGap) {
        smallestGap = currentGap;
        bestPair = line; // The line itself is the array [selectionOne, selectionTwo]
      }
    }
  }

  return bestPair;
};
