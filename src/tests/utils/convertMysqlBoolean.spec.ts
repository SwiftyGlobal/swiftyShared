import { convertMysqlBoolean } from '../../utils';
import type { MysqlBoolean } from '../../types';

describe('convertMysqlBoolean', () => {
  it('should return true for 1', () => {
    const result = convertMysqlBoolean(1 as MysqlBoolean);
    expect(result).toBe(true);
  });

  it('should return false for 0', () => {
    const result = convertMysqlBoolean(0 as MysqlBoolean);
    expect(result).toBe(false);
  });

  it('should return true for boolean true', () => {
    const result = convertMysqlBoolean(true);
    expect(result).toBe(true);
  });

  it('should return false for boolean false', () => {
    const result = convertMysqlBoolean(false);
    expect(result).toBe(false);
  });

  it('should return false for undefined', () => {
    const result = convertMysqlBoolean(undefined);
    expect(result).toBe(false);
  });
});
