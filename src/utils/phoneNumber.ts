/**
 * @description - Utility function for phone number validation and formatting.
 * @example
 * validatePhoneNumber("123-456-7890", "44") // returns "1234567890"
 */
export const formatOnlyDigits = (value: string): string => (value ? value.replace(/\D+/g, '').toString() : '');

/**
 * @description - Utility function to remove leading zero from a string.
 * @example
 * stripLeadingZero("012345") // returns "12345"
 */
export const stripLeadingZero = (value: string) => {
  return value.replace(/^0/, '');
};

export const validateAndNormalizePhoneNumber = (phoneNumber: string, prefix: string) => {
  const ukRe = /^0?7\d{9}$/; // UK: 10 digits (with optional 0 → 7#########)
  const ieRe = /^0?8[356789]\d{7}$/; // IE: 9 digits (with optional 0 → 8[3,5,6,7,9]#######)
  const zaRe = /^0?[678]\d{8}$/; // ZA: 9 digits (with optional 0 → [6,7,8]########)

  const phoneRegexps: Record<string, RegExp> = {
    '44': ukRe,
    '353': ieRe,
    '27': zaRe,
  };

  const localRegexp = phoneRegexps[prefix];

  if (localRegexp && !localRegexp.test(phoneNumber)) {
    throw new Error('Invalid phone number format');
  }

  const onlyDigits = formatOnlyDigits(phoneNumber);

  const phoneWithoutZero = stripLeadingZero(onlyDigits);

  return phoneWithoutZero;
};
