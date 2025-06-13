import { getDbResponseMap } from '../../utils';

describe('getDbResponseMap', () => {
  type TestItem = { id: string; name: string; age?: number };

  const dbResponse: TestItem[] = [
    { id: '1', name: 'Alice', age: 30 },
    { id: '2', name: 'Bob', age: 25 },
    { id: '3', name: 'Charlie' },
  ];

  it('should convert array to map indexed by id', () => {
    const result = getDbResponseMap(dbResponse, 'id');

    expect(result).toEqual({
      '1': { id: '1', name: 'Alice', age: 30 },
      '2': { id: '2', name: 'Bob', age: 25 },
      '3': { id: '3', name: 'Charlie' },
    });
  });

  it('should convert array to map indexed by name', () => {
    const result = getDbResponseMap(dbResponse, 'name');

    expect(result).toEqual({
      Alice: { id: '1', name: 'Alice', age: 30 },
      Bob: { id: '2', name: 'Bob', age: 25 },
      Charlie: { id: '3', name: 'Charlie' },
    });
  });

  it('should overwrite duplicate keys with the last occurrence', () => {
    const duplicatedArray: TestItem[] = [
      { id: '1', name: 'Alice' },
      { id: '1', name: 'Alicia' },
    ];

    const result = getDbResponseMap(duplicatedArray, 'id');

    expect(result).toEqual({
      '1': { id: '1', name: 'Alicia' },
    });
  });

  it('should return empty object if input array is empty', () => {
    const result = getDbResponseMap([], 'id');
    expect(result).toEqual({});
  });
});
