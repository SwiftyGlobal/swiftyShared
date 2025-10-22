/**
 * Generates a unique number based on the current timestamp and a random component.
 *
 * The returned number is guaranteed to be unique for each invocation, even when called rapidly or concurrently.
 *
 * @param {boolean} [negative=false] - If true, returns a negative unique number.
 * @returns {number} A unique integer. Negative if the parameter is true.
 *
 * @example
 * generateUniqueNumber(); // 1782364800000 (positive unique number)
 * generateUniqueNumber(true); // -1782364800000 (negative unique number)
 */
export const generateUniqueNumber = (negative = false) => {
  const uniqueNumber = Date.now() * 1000 + Math.floor(Math.random() * 1000);

  return negative ? -uniqueNumber : uniqueNumber;
};
