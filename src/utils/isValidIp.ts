import { isIP } from 'node:net';

/**
 * Checks if a given string is a syntactically valid IPv4 or IPv6 address.
 *
 * This function utilizes the native Node.js `net.isIP()` method to validate
 * the format of the IP address.
 *
 * @remarks
 * This function only validates the *syntax* of the IP. It does not verify
 * if the IP is reachable, active, or public/private.
 *
 * @param {string} input - The string to validate.
 * @returns {boolean} `true` if the input is a valid IPv4 or IPv6 address, `false` otherwise.
 *
 * @example
 * ```typescript
 * isValidIP("192.168.1.1"); // returns true
 * isValidIP("::1");         // returns true
 * isValidIP("google.com");  // returns false
 * isValidIP("999.9.9.9");   // returns false
 * ```
 */
export function isValidIP(input: string): boolean {
  // net.isIP returns 0 for invalid, 4 for IPv4, and 6 for IPv6
  const result = isIP(input);

  return result !== 0;
}
