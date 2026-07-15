<?php

namespace Core;

use Core\Middleware\MiddlewareInterface;

/**
 * PHP API Router.
 *
 * Matches incoming HTTP method + URI against registered routes and
 * dispatches to the appropriate controller method.
 *
 * Route parameters are defined with a colon prefix, e.g.:
 *   Router::get('/api/posts/:id', 'PostController@show');
 *
 * Middleware is resolved by name from a registry set via setMiddlewareRegistry().
 * Each named entry must point to a class implementing MiddlewareInterface.
 *
 * To add a new middleware:
 *   1. Create a class implementing MiddlewareInterface in app/Core/Middleware/.
 *   2. Register it in app/middleware.php: 'name' => YourClass::class
 *   3. Use the name in your routes: Router::get('...', '...', ['name']);
 */
class Router
{
    /** @var array<int, array{method: string, path: string, handler: string, middleware: string[], regex: string}> */
    private static array $routes = [];

    /**
     * Middleware registry: maps a name (e.g. 'auth') to a fully-qualified class name.
     * @var array<string, class-string<MiddlewareInterface>>
     */
    private static array $middlewareRegistry = [];

    // ── Registry ──────────────────────────────────────────────────────────────

    /**
     * Register the application middleware map.
     * Typically loaded from app/middleware.php via public/index.php.
     *
     * @param array<string, class-string<MiddlewareInterface>> $registry
     */
    public static function setMiddlewareRegistry(array $registry): void
    {
        self::$middlewareRegistry = $registry;
    }

    // ── Route Registration ────────────────────────────────────────────────────

    public static function get(string $path, string $handler, array $middleware = []): void
    {
        self::addRoute('GET', $path, $handler, $middleware);
    }

    public static function post(string $path, string $handler, array $middleware = []): void
    {
        self::addRoute('POST', $path, $handler, $middleware);
    }

    public static function put(string $path, string $handler, array $middleware = []): void
    {
        self::addRoute('PUT', $path, $handler, $middleware);
    }

    public static function delete(string $path, string $handler, array $middleware = []): void
    {
        self::addRoute('DELETE', $path, $handler, $middleware);
    }

    private static function addRoute(string $method, string $path, string $handler, array $middleware = []): void
    {
        self::$routes[] = [
            'method'     => $method,
            'path'       => $path,
            'handler'    => $handler,
            'middleware' => $middleware,
            'regex'      => self::pathToRegex($path),
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
                // Run the middleware pipeline
                self::runMiddleware($route['middleware'], $request);

                // $matches[0] is the full match — drop it
                $params = array_slice($matches, 1);
                self::callHandler($route['handler'], $params);
                return;
            }
        }

        // No route matched
        Response::error("Route not found: [{$method}] {$uri}", 404);
    }

    // ── Middleware Pipeline ───────────────────────────────────────────────────

    /**
     * Resolve each middleware name from the registry and call handle().
     * Middlewares run in the order they are listed on the route.
     *
     * @throws \RuntimeException if a middleware name is not registered.
     */
    private static function runMiddleware(array $middleware, Request $request): void
    {
        foreach ($middleware as $name) {
            if (!isset(self::$middlewareRegistry[$name])) {
                // Fail loudly — an unknown middleware name is a developer error.
                Response::error("Middleware '{$name}' is not registered. Add it to app/middleware.php.", 500);
            }

            $class = self::$middlewareRegistry[$name];
            /** @var MiddlewareInterface $instance */
            $instance = new $class();
            $instance->handle($request);
        }
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
