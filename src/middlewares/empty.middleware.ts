import type { MiddyMiddleware } from '@internal-types/middyMiddleware';

/**
 * @desc this middleware needs to skip other middlewares without any checking
 */
export const emptyMiddleware: MiddyMiddleware = () => {
  return {
    before: () => undefined,
  };
};
