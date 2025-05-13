import type { IdWithProvider, SportProviders } from '../types';

/**
 * @description generates raw prefix without id
 * @example
 * const selectionIdWithPrefix = 'a-320117421-0';
 * const provider = getProviderWithoutId(idWithPrefixProvider) -> 'a'
 */
export const getProviderWithoutId = (idWithPrefixProvider: IdWithProvider): SportProviders => {
  return idWithPrefixProvider.slice(0, 1) as SportProviders;
};
