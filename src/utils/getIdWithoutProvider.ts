import type { IdWithProvider } from '../types';

/**
 * @description generates raw selection id without prefix
 * @example
 * const selectionIdWithPrefix = 'a-320117421-0';
 * const rawSelectionId = getIdWithoutProvider(idWithPrefixProvider) -> '320117421-0'
 */
export const getIdWithoutProvider = (idWithPrefixProvider: IdWithProvider): string => {
  return idWithPrefixProvider.slice(2);
};
