import type { MiddlewareObj } from '@middy/core';

export type MiddyMiddleware = (config?: any) => MiddlewareObj;
