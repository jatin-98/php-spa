<?php

namespace Core;

/**
 * PHP API Router.
 *
 * Matches incoming HTTP method + URI against registered routes and
 * dispatches to the appropriate controller method.
 *
 * Route parameters are defined with a colon prefix, e.g.:
 *   $router->get('/api/posts/:id', 'PostController@show');
 */
class Router
{
    /** @var array<int, array{method: string, path: string, handler: string, regex: string}> */
    private array   $routes = [];
    private Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    // ── Route Registration ────────────────────────────────────────────────────

    public function get(string $path, string $handler): static
    {
        return $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, string $handler): static
    {
        return $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, string $handler): static
    {
        return $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, string $handler): static
    {
        return $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, string $handler): static
    {
        $this->routes[] = [
            'method'  => $method,
            'path'    => $path,
            'handler' => $handler,
            'regex'   => $this->pathToRegex($path),
        ];

        return $this;
    }

    // ── Dispatching ───────────────────────────────────────────────────────────

    public function dispatch(): void
    {
        $method = $this->request->getMethod();
        $uri    = $this->request->getUri();

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['regex'], $uri, $matches)) {
                // $matches[0] is the full match — drop it
                $params = array_slice($matches, 1);
                $this->callHandler($route['handler'], $params);
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
    private function pathToRegex(string $path): string
    {
        $escaped = preg_quote($path, '#');
        $pattern = preg_replace('/\\\\:[a-zA-Z_][a-zA-Z0-9_]*/', '([^/]+)', $escaped);
        return '#^' . $pattern . '$#';
    }

    /**
     * Instantiate the controller and call the method with route params.
     * Handler format: "ControllerClass@methodName"
     */
    private function callHandler(string $handler, array $params): void
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
