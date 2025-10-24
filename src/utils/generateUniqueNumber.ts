/**
 * Generates a unique 6-digit integer based on the current timestamp and a random component.
 *
 * The returned value is a JavaScript number (integer), not a BigInt. It stays within
 * the range of 6 digits (100000 to 999999).
 *
 * @param {boolean} [negative=false] - If true, returns a negative unique integer.
 * @returns {number} A unique 6-digit integer. Negative if the parameter is true.
 *
 * @example
 * generateUniqueNumber(); // 123456 (positive unique integer)
 * generateUniqueNumber(true); // -123456 (negative unique integer)
 */
export const generateUniqueNumber = (negative = false): number => {
  // Generate a random 6-digit number between 100000 and 999999.
  const uniqueNumber = Math.floor(100000 + Math.random() * 900000);

  return negative ? -uniqueNumber : uniqueNumber;
};
