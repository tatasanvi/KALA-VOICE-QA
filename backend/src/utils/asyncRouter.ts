import { Router as expressRouter } from 'express';
import type { RequestHandler } from 'express';

function wrap(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    try {
      const result: unknown = handler(req, res, next);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        (result as Promise<unknown>).catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
}

// Express 4 does not forward rejected promises automatically. Wrap route
// callbacks so async PostgreSQL errors reach Express's error handler.
export function Router() {
  const router = expressRouter();
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'all'] as const;
  for (const method of methods) {
    const original = router[method].bind(router) as (...handlers: any[]) => any;
    (router as any)[method] = (...handlers: unknown[]) =>
      original(...handlers.map((handler) =>
        typeof handler === 'function' ? wrap(handler as RequestHandler) : handler
      ));
  }
  return router;
}
