import type { MysqlBoolean } from '../types';

export const convertMysqlBoolean = (mysqlBoolean?: MysqlBoolean | boolean): boolean => {
  return Boolean(mysqlBoolean);
};
