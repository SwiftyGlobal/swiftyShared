import { emptyMiddleware } from '../../../src';

describe('emptyMiddleware', () => {
  it('should return a middleware object with only the "before" hook', () => {
    const middleware = emptyMiddleware();

    expect(typeof middleware).toBe('object');
    expect(middleware).toHaveProperty('before');
    expect(typeof middleware.before).toBe('function');
    expect(middleware).not.toHaveProperty('after');
    expect(middleware).not.toHaveProperty('onError');
  });

  it('should do nothing in "before" hook', async () => {
    const middleware = emptyMiddleware();

    const result = await middleware.before?.({} as any);

    expect(result).toBeUndefined();
  });
});
