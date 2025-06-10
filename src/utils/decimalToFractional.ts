import { oddsConversion, oddsConversionV2, oddsKeys } from '../common';

/**
 * Converts a decimal odds value to fractional odds format.
 *
 * @param {number} value - The decimal odds value to convert.
 * @returns {string} The fractional odds representation of the input value.
 */

export const decimalToFractional = (value: number): string => {
  if (value === 0) {
    return 'SP';
  }

  // Get fixed decimal value
  const tempValue = Number(value.toFixed(5)) * 1;

  const predefinedValue = oddsConversionV2[tempValue];

  if (predefinedValue) {
    // console.log('predefinedValue', predefinedValue);
    return predefinedValue;
  }

  // If the number is without decimals
  if (value % 1 === 0) {
    return `${value - 1}/1`;
  }

  // If the decimal is not inside the predefined values, then find the closest value
  const keys = oddsKeys;

  for (let i = 0; i < keys.length; i++) {
    const key: number = parseFloat(String(keys[i]));

    const currentOdd = key;

    if (value <= currentOdd) {
      if (i === 0) {
        // console.log('i === 0', value, keys[i]);
        return oddsConversionV2[key];
      }

      // Go one step back
      const previousOdd = String(keys[i - 1]);

      // console.log('previousOdd', previousOdd);
      return oddsConversion[parseFloat(previousOdd)];
    }
  }

  return value * 100 + '/100';
};
