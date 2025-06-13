import { getHeaders } from '../../libs';

describe('getHeaders', () => {
  it.each([
    ['post', 'OPTIONS,POST'],
    ['get', 'OPTIONS,GET'],
    ['delete', 'OPTIONS,DELETE'],
    ['put', 'OPTIONS,PUT'],
    ['all', 'OPTIONS,GET,POST,PUT,DELETE'],
    ['unknown', 'OPTIONS,GET,POST,PUT,DELETE'],
    ['PoSt', 'OPTIONS,POST'],
    ['GET', 'OPTIONS,GET'],
  ])('should return correct CORS headers for method "%s"', (method, expectedMethods) => {
    const result = getHeaders({ method });

    expect(result).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': expectedMethods,
    });
  });
});
