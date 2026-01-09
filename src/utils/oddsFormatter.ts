import { oddsConversionV2, oddsKeys } from '../common';

export interface OddsConversionResult {
  decimal: string;
  fractional: string;
}

/**
 * Converts a decimal odds value to fractional odds format (V2).
 * Returns an object with both decimal and fractional representations.
 *
 * @param value - The decimal odds value to convert
 * @returns An object containing the decimal and fractional odds representations
 */
export const decimalToFractionalV2 = (value: number): OddsConversionResult => {
  const decimalValue = Number(value.toFixed(5));

  // Check if the exact value exists in the conversion map
  const exactMatch = oddsConversionV2[decimalValue as keyof typeof oddsConversionV2];
  if (exactMatch) {
    return {
      decimal: String(decimalValue),
      fractional: exactMatch,
    };
  }

  // Find the closest value if exact match not found
  for (let i = 0; i < oddsKeys.length; i++) {
    const currentOdd = oddsKeys[i] as number;

    if (decimalValue < currentOdd) {
      if (i === 0) {
        const firstOddValue = currentOdd as number;
        const firstOddFractional = oddsConversionV2[firstOddValue as keyof typeof oddsConversionV2];

        return {
          decimal: String(firstOddValue),
          fractional: firstOddFractional || '0/1',
        };
      }

      // Return the current (next) key to match Java behavior
      // When value is between keys, round UP to the next available key
      const currentOddFractional = oddsConversionV2[currentOdd as keyof typeof oddsConversionV2];

      return {
        decimal: String(currentOdd),
        fractional: currentOddFractional || '0/1',
      };
    }
  }

  return {
    decimal: '1',
    fractional: '0/1',
  };
};
