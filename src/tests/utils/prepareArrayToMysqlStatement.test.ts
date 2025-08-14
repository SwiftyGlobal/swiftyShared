import { prepareArrayToMysqlStatement } from '../../utils';

describe('prepareArrayToMysqlStatement', () => {
  it('returns [null] when the input array is empty', () => {
    const result = prepareArrayToMysqlStatement([]);
    expect(result).toEqual([null]);
  });

  it('returns the same array when the input array is not empty', () => {
    const input = [1, 2, 3];
    const result = prepareArrayToMysqlStatement(input);
    expect(result).toBe(input);
  });

  it('handles an array with a single element correctly', () => {
    const input = [42];
    const result = prepareArrayToMysqlStatement(input);
    expect(result).toBe(input);
  });

  it('handles an array with mixed types correctly', () => {
    const input = [1, 'two', true, null];
    const result = prepareArrayToMysqlStatement(input);
    expect(result).toBe(input);
  });

  it('returns [null] for an empty array of objects', () => {
    const result = prepareArrayToMysqlStatement([]);
    expect(result).toEqual([null]);
  });
});
