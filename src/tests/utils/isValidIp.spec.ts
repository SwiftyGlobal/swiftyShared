import { isValidIP } from '../../utils';

describe('isValidIP', () => {
  it('should return true for valid IPv4 address', () => {
    expect(isValidIP('192.168.1.1')).toBe(true);
  });

  it('should return true for localhost IPv4', () => {
    expect(isValidIP('127.0.0.1')).toBe(true);
  });

  it('should return true for IPv4 address with all zeros', () => {
    expect(isValidIP('0.0.0.0')).toBe(true);
  });

  it('should return true for IPv4 address with max values', () => {
    expect(isValidIP('255.255.255.255')).toBe(true);
  });

  it('should return true for valid IPv6 address', () => {
    expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
  });

  it('should return true for compressed IPv6 address', () => {
    expect(isValidIP('2001:db8:85a3::8a2e:370:7334')).toBe(true);
  });

  it('should return true for localhost IPv6', () => {
    expect(isValidIP('::1')).toBe(true);
  });

  it('should return true for IPv6 loopback full form', () => {
    expect(isValidIP('0000:0000:0000:0000:0000:0000:0000:0001')).toBe(true);
  });

  it('should return true for IPv6 all zeros', () => {
    expect(isValidIP('::')).toBe(true);
  });

  it('should return true for IPv6 with single compression', () => {
    expect(isValidIP('fe80::1')).toBe(true);
  });

  it('should return true for IPv6 with mixed notation', () => {
    expect(isValidIP('::ffff:192.0.2.1')).toBe(true);
  });

  it('should return false for IPv4 with invalid octet value', () => {
    expect(isValidIP('999.9.9.9')).toBe(false);
  });

  it('should return false for IPv4 with too many octets', () => {
    expect(isValidIP('192.168.1.1.1')).toBe(false);
  });

  it('should return false for IPv4 with too few octets', () => {
    expect(isValidIP('192.168.1')).toBe(false);
  });

  it('should return false for IPv4 with non-numeric characters', () => {
    expect(isValidIP('192.168.a.1')).toBe(false);
  });

  it('should return false for IPv4 with negative numbers', () => {
    expect(isValidIP('192.168.-1.1')).toBe(false);
  });

  it('should return false for domain name', () => {
    expect(isValidIP('google.com')).toBe(false);
  });

  it('should return false for hostname', () => {
    expect(isValidIP('localhost')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidIP('')).toBe(false);
  });

  it('should return false for string with only spaces', () => {
    expect(isValidIP('   ')).toBe(false);
  });

  it('should return false for IPv4 with spaces', () => {
    expect(isValidIP('192.168. 1.1')).toBe(false);
  });

  it('should return false for IPv6 with invalid characters', () => {
    expect(isValidIP('gggg::1')).toBe(false);
  });

  it('should return false for IPv6 with too many colons', () => {
    expect(isValidIP(':::1')).toBe(false);
  });

  it('should return false for IPv6 with multiple compressions', () => {
    expect(isValidIP('2001::25de::cade')).toBe(false);
  });

  it('should return false for random text', () => {
    expect(isValidIP('not an ip address')).toBe(false);
  });

  it('should return false for URL', () => {
    expect(isValidIP('http://192.168.1.1')).toBe(false);
  });

  it('should return false for IPv4 with port', () => {
    expect(isValidIP('192.168.1.1:8080')).toBe(false);
  });

  it('should return false for IPv6 with port', () => {
    expect(isValidIP('[::1]:8080')).toBe(false);
  });

  it('should return false for special characters', () => {
    expect(isValidIP('!@#$%^&*()')).toBe(false);
  });

  it('should return false for null input', () => {
    expect(isValidIP(null as any)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isValidIP(undefined as any)).toBe(false);
  });

  it('should return false for number input', () => {
    expect(isValidIP(192168 as any)).toBe(false);
  });

  it('should return false for object input', () => {
    expect(isValidIP({ ip: '192.168.1.1' } as any)).toBe(false);
  });
});
