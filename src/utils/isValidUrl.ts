/**
 * Checks if a string is a valid URL.
 * @param value - The string to be validated as a URL.
 * @returns {boolean} - True if the string is a valid URL, false otherwise.
 */
export const isValidUrl = (value: unknown): boolean => {
  try {
    if (typeof value !== 'string') {
      return false;
    }

    new URL(value);

    return true;
  } catch (err) {
    return false;
  }
};
