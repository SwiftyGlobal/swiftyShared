import type { OddsFormatsModel } from '../../models';
import type { Nullable } from '../../types';

const areValidOpposingSelections = <
  T extends {
    participant_role_id?: Nullable<string>;
    outcome_id?: Nullable<number>;
  },
>(
  line: T[],
  evensType: 'participant' | 'outcome',
): boolean => {
  const [first, second] = line;

  if (evensType === 'participant') {
    if (!first.participant_role_id || !second.participant_role_id) {
      return false;
    }

    return first.participant_role_id !== second.participant_role_id;
  }

  if (first.outcome_id === undefined || second.outcome_id === undefined) {
    return false;
  }

  if (first.outcome_id === null || second.outcome_id === null) {
    return false;
  }

  return first.outcome_id !== second.outcome_id;
};

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
export const findEvensSelections = <
  T extends {
    handicap?: Nullable<string>;
    participant_role_id?: Nullable<string>;
    outcome_id?: Nullable<number>;
  } & OddsFormatsModel,
>(
  selections: T[],
  evensType: 'participant' | 'outcome' = 'outcome',
): T[] => {
  // For 'participant' evens, we want opposite handicaps (-h and +h)
  if (evensType === 'participant') {
    type Bucket = { pos: T[]; neg: T[] };
    const byAbsHandicap = new Map<string, Bucket>();

    for (const selection of selections) {
      const handicap = selection.handicap;

      if (!handicap) {
        continue;
      }

      const numeric = parseFloat(handicap);

      if (Number.isNaN(numeric)) {
        continue;
      }

      const absKey = Math.abs(numeric).toString();
      if (!byAbsHandicap.has(absKey)) {
        byAbsHandicap.set(absKey, { pos: [], neg: [] });
      }

      const bucket = byAbsHandicap.get(absKey)!;
      if (numeric >= 0) {
        bucket.pos.push(selection);
      } else {
        bucket.neg.push(selection);
      }
    }

    let smallestGap = Infinity;
    let bestPair: T[] = [];

    for (const bucket of byAbsHandicap.values()) {
      if (bucket.pos.length === 0 || bucket.neg.length === 0) {
        continue;
      }

      for (const posSel of bucket.pos) {
        for (const negSel of bucket.neg) {
          const pair: T[] = [posSel, negSel];
          if (!areValidOpposingSelections(pair, 'participant')) {
            continue;
          }

          const priceOne = parseFloat(posSel.odds_decimal);
          const priceTwo = parseFloat(negSel.odds_decimal);
          const currentGap = Math.abs(priceOne - priceTwo);

          if (currentGap < smallestGap) {
            smallestGap = currentGap;
            bestPair = pair;
          }
        }
      }
    }

    return bestPair;
  }

  const marketLines = new Map<string, T[]>();

  for (const selection of selections) {
    const handicap = selection.handicap;

    if (!handicap) {
      continue;
    }

    if (!marketLines.has(handicap)) {
      marketLines.set(handicap, []);
    }

    marketLines.get(handicap)!.push(selection);
  }

  let smallestGap = Infinity;
  let bestPair: T[] = [];

  for (const line of marketLines.values()) {
    if (line.length === 2 && areValidOpposingSelections(line, 'outcome')) {
      const selectionOne = line[0];
      const selectionTwo = line[1];
      const priceOne = parseFloat(selectionOne.odds_decimal);
      const priceTwo = parseFloat(selectionTwo.odds_decimal);
      const currentGap = Math.abs(priceOne - priceTwo);
      if (currentGap < smallestGap) {
        smallestGap = currentGap;
        bestPair = line;
      }
    }
  }

  return bestPair;
};
