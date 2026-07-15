<?php

namespace Core\Middleware;

use Core\Auth;
use Core\Request;

/**
 * AuthMiddleware
 *
 * Ensures the request has a valid JWT bearer token.
 * Blocks with 401 Unauthorized if no token is present or it is invalid.
 */
class AuthMiddleware implements MiddlewareInterface
{
    public function handle(Request $request): void
    {
        Auth::guard();
    }
}
