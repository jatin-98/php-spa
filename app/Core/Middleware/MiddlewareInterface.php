<?php

namespace Core\Middleware;

use Core\Request;

/**
 * MiddlewareInterface
 *
 * All middleware classes must implement this interface.
 * The `handle()` method receives the current request and should either:
 *  - Return normally to allow the request to proceed.
 *  - Call Response::error() (which calls exit) to halt the pipeline.
 *
 * Example:
 *   class AuthMiddleware implements MiddlewareInterface {
 *       public function handle(Request $request): void {
 *           // verify JWT, or call Response::error('Unauthorized', 401);
 *       }
 *   }
 */
interface MiddlewareInterface
{
    /**
     * Handle the incoming request.
     *
     * If the middleware needs to block the request, it must call
     * Response::error() which internally calls exit().
     */
    public function handle(Request $request): void;
}
