import type { MysqlBoolean } from '../types';

/**
 * @description Converts a MySQL boolean value (or a standard boolean) to a JavaScript boolean.
 * @param {MysqlBoolean | boolean | undefined} mysqlBoolean - The MySQL boolean value or standard boolean to convert.
 * @returns {boolean} The converted JavaScript boolean value.
 */

export const convertMysqlBoolean = (mysqlBoolean?: MysqlBoolean | boolean): boolean => {
  return Boolean(mysqlBoolean);
};
