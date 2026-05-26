import type { AppRouteHandlerRoutes } from '../../.next/dev/types/routes';
import type { NextRequest } from 'next/server';

export type RouteHandler<AppRouteHandlerRoute extends AppRouteHandlerRoutes> =
  (request: NextRequest, context: RouteContext<AppRouteHandlerRoute>) => Promise<Response>;
