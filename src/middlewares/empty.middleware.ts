import type { MiddyMiddleware } from '../types';

/**
 * @desc this middleware needs to skip other middlewares without any checking
 */
export const emptyMiddleware: MiddyMiddleware = () => {
  return {
    before: () => undefined,
  };
};
