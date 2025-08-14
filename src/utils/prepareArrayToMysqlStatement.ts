export type PreparedArrayMysqlValue<T> = T[] | [null];

/**
 * @description
 * Returns array with one null value
 * The purpose is to prepare array for mysql prepared statement WHERE IN (?), because if an empty array is used for that, then error occurs
 */
export const prepareArrayToMysqlStatement = <T>(array: T[]): PreparedArrayMysqlValue<T> => {
  if (!array.length) {
    return [null];
  }

  return array;
};
