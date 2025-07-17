/**
 * @description - Capitalizes the first letter of each word in a string.
 * If the input is not a string (e.g., null, undefined, number, object), it is returned as is.
 *
 * @example
 * capitalizeWords('hello world') => 'Hello World'
 * capitalizeWords('hElLo   wOrLd') => 'Hello   World'
 * capitalizeWords(null) => null
 * capitalizeWords(123) => 123
 *
 * @param {unknown} str - The input value to be transformed.
 * @returns {unknown} - A new string with each word capitalized, or the original value if it's not a string.
 */

export function capitalizeWords(str: unknown): unknown {
  if (!str) return str;
  if (typeof str !== 'string') return str;

  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
