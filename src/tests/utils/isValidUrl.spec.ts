import { isValidUrl } from '../../utils';

describe('isValidUrl', () => {
  it('should return true for valid http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('should return true for valid https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('should return true for URL with path', () => {
    expect(isValidUrl('https://example.com/path/to/resource')).toBe(true);
  });

  it('should return true for URL with query parameters', () => {
    expect(isValidUrl('https://example.com?param=value&another=test')).toBe(true);
  });

  it('should return true for URL with hash', () => {
    expect(isValidUrl('https://example.com#section')).toBe(true);
  });

  it('should return true for URL with port', () => {
    expect(isValidUrl('https://example.com:8080')).toBe(true);
  });

  it('should return true for URL with subdomain', () => {
    expect(isValidUrl('https://subdomain.example.com')).toBe(true);
  });

  it('should return true for URL with authentication', () => {
    expect(isValidUrl('https://user:pass@example.com')).toBe(true);
  });

  it('should return true for localhost URL', () => {
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('should return true for IP address URL', () => {
    expect(isValidUrl('http://192.168.1.1')).toBe(true);
  });

  it('should return true for ftp protocol', () => {
    expect(isValidUrl('ftp://files.example.com')).toBe(true);
  });

  it('should return false for string without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('should return false for invalid URL format', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isValidUrl(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidUrl(undefined)).toBe(false);
  });

  it('should return false for number', () => {
    expect(isValidUrl(123)).toBe(false);
  });

  it('should return false for boolean', () => {
    expect(isValidUrl(true)).toBe(false);
  });

  it('should return false for object', () => {
    expect(isValidUrl({ url: 'https://example.com' })).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidUrl(['https://example.com'])).toBe(false);
  });

  it('should return false for malformed URL with spaces', () => {
    expect(isValidUrl('https://example .com')).toBe(false);
  });

  it('should return true for URL with special characters in path', () => {
    expect(isValidUrl('https://example.com/path%20with%20spaces')).toBe(true);
  });
});
