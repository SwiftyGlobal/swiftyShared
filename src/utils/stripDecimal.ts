import Decimal from 'decimal.js';

/**
 * Strips a number to a maximum of 5 decimal places using the Decimal.js library.
 *
 * @param {number} value - The number to be stripped to 5 decimal places.
 * @returns {Decimal} A Decimal.js object representing the number with up to 5 decimal places.
 */

export const stripDecimal = (value: number) => {
  return new Decimal(value).toDecimalPlaces(5);
};
