/**
 * Checks if the given value is an object.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} `true` if the value is an object and not an array or `null`, otherwise `false`.
 */

export const isObject = (value: any): boolean => {
  return !Array.isArray(value) && typeof value === 'object' && value !== null;
};
