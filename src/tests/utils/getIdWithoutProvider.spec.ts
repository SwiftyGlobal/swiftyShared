import { getIdWithoutProvider } from '../../utils';

describe('getIdWithoutProvider', () => {
  it('returns the id without the provider prefix for valid input', () => {
    const result = getIdWithoutProvider('a-320117421-0');
    expect(result).toBe('320117421-0');
  });

  it('returns the id without the provider prefix for another valid input', () => {
    const result = getIdWithoutProvider('c-123456789-1');
    expect(result).toBe('123456789-1');
  });

  it('returns an empty string if the input is only the prefix', () => {
    const result = getIdWithoutProvider('a-');
    expect(result).toBe('');
  });

  it('handles special characters in the id correctly', () => {
    const result = getIdWithoutProvider('c-!@#$%^&*()-_');
    expect(result).toBe('!@#$%^&*()-_');
  });
});
