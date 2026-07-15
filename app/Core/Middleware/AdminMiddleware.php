<?php

namespace Core\Middleware;

use Core\Auth;
use Core\Request;

/**
 * AdminMiddleware
 *
 * Ensures the request has a valid JWT bearer token AND the user has the 'admin' role.
 * Blocks with 401 if unauthenticated, 403 if authenticated but not an admin.
 */
class AdminMiddleware implements MiddlewareInterface
{
    public function handle(Request $request): void
    {
        Auth::adminGuard();
    }
}
