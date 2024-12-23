import type { MysqlBoolean } from '@internal-types/mysqlBoolean';

export const convertMysqlBoolean = (mysqlBoolean?: MysqlBoolean | boolean): boolean => {
  return Boolean(mysqlBoolean);
};
