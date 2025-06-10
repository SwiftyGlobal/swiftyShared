/**
 * Formats a number into a string with commas as thousands separators
 * and ensures exactly two decimal places.
 *
 * @param {number} value - The number to format.
 * @returns {string} The formatted number as a string.
 */

export const numberFormatter = (value: number) => {
  let new_value = value.toLocaleString('en-US', { maximumFractionDigits: 2 });

  if (new_value.indexOf('.') > -1) {
    const decimal_places = new_value.split('.')[1].length;
    if (decimal_places === 1) {
      new_value += '0';
    }
  } else {
    new_value += '.00';
  }

  return new_value;
};
