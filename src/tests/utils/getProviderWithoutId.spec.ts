import { getProviderWithoutId } from '../../utils';
import type { IdWithProvider } from '../../types';

describe('getProviderWithoutId', () => {
  it('returns the correct provider prefix for a valid id with prefix', () => {
    const idWithPrefix: IdWithProvider = 'a-320117421-0';
    const result = getProviderWithoutId(idWithPrefix);
    expect(result).toBe('a');
  });

  it('returns the first character when idWithPrefixProvider is a single character', () => {
    const idWithPrefix: IdWithProvider = 'c-';
    const result = getProviderWithoutId(idWithPrefix);
    expect(result).toBe('c');
  });
});
