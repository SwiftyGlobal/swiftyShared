/**
 * Converts an array of database response objects into a map. Can be used when the database response is an array and the data has to be indexed by a specific key.
 *
 * @template T - The type of the objects in the database response array.
 * @template K - The type of the key used to index the map.
 * @param { T[] } dbResponse - The array of database response objects (Raw array response from database).
 * @param { K } key - The key to use for indexing the map. Usually a unique identifier (e.g. 'id', 'event_id', 'event_name').
 * @returns { Record<string, T> } - A map where the keys are the values of the specified key in each object, and the values are the objects themselves.
 * @example
 *  const dbResponse = [
 *    { id: '1', name: 'Alice' },
 *    { id: '2', name: 'Bob' }
 *  ];
 *  const result = getDbResponseMap(dbResponse, 'id');
 *  result: { '1': { id: '1', name: 'Alice' }, '2': { id: '2', name: 'Bob' } }
 */
export const getDbResponseMap = <T extends Record<string, any>>(dbResponse: T[], key: keyof T): Record<string, T> => {
  const map: ObjectsArrayToMap<T> = {};

  dbResponse.forEach((item: T) => {
    map[item[key]] = item;
  });

  return map;
};

/**
 * Converts an array of objects into a map. Needs to be used when the data is an array and the data needs to be indexed by a specific key.
 */
export type ObjectsArrayToMap<T extends Record<string, any>> = Record<string, T>;
