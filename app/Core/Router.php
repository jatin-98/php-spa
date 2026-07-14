<?php

namespace Core;

/**
 * PHP API Router.
 *
 * Matches incoming HTTP method + URI against registered routes and
 * dispatches to the appropriate controller method.
 *
 * Route parameters are defined with a colon prefix, e.g.:
 *   Router::get('/api/posts/:id', 'PostController@show');
 */
class Router
{
    /** @var array<int, array{method: string, path: string, handler: string, regex: string}> */
    private static array $routes = [];

    // ── Route Registration ────────────────────────────────────────────────────

    public static function get(string $path, string $handler): void
    {
        self::addRoute('GET', $path, $handler);
    }

    public static function post(string $path, string $handler): void
    {
        self::addRoute('POST', $path, $handler);
    }

    public static function put(string $path, string $handler): void
    {
        self::addRoute('PUT', $path, $handler);
    }

    public static function delete(string $path, string $handler): void
    {
        self::addRoute('DELETE', $path, $handler);
    }

    private static function addRoute(string $method, string $path, string $handler): void
    {
        self::$routes[] = [
            'method'  => $method,
            'path'    => $path,
            'handler' => $handler,
            'regex'   => self::pathToRegex($path),
        ];
    }

    // ── Dispatching ───────────────────────────────────────────────────────────

    public static function dispatch(Request $request): void
    {
        $method = $request->getMethod();
        $uri    = $request->getUri();

        foreach (self::$routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['regex'], $uri, $matches)) {
                // $matches[0] is the full match — drop it
                $params = array_slice($matches, 1);
                self::callHandler($route['handler'], $params);
                return;
            }
        }

        // No route matched
        Response::error("Route not found: [{$method}] {$uri}", 404);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Convert a path like /api/posts/:id into a regex like #^/api/posts/([^/]+)$#
     */
    private static function pathToRegex(string $path): string
    {
        $escaped = preg_quote($path, '#');
        $pattern = preg_replace('/\\\\:[a-zA-Z_][a-zA-Z0-9_]*/', '([^/]+)', $escaped);
        return '#^' . $pattern . '$#';
    }

    /**
     * Instantiate the controller and call the method with route params.
     * Handler format: "ControllerClass@methodName"
     */
    private static function callHandler(string $handler, array $params): void
    {
        [$class, $method] = explode('@', $handler, 2);
        $fqcn = "Controllers\\{$class}";

        if (!class_exists($fqcn)) {
            Response::error("Controller not found: {$fqcn}", 500);
        }

        $controller = new $fqcn();

        if (!method_exists($controller, $method)) {
            Response::error("Method not found: {$fqcn}::{$method}", 500);
        }

        call_user_func_array([$controller, $method], $params);
    }
}
