<?php

namespace Core;

/**
 * HTTP Request wrapper.
 * Provides a clean interface to access the incoming HTTP request data.
 */
class Request
{
    private string $method;
    private string $uri;
    private array  $queryParams;
    private ?array $body;

    public function __construct()
    {
        $this->method      = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->uri         = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $this->queryParams = $_GET;
        $this->body        = $this->parseBody();
    }

    // ── Parsing ───────────────────────────────────────────────────────────────

    private function parseBody(): ?array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true);
        }

        return !empty($_POST) ? $_POST : null;
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getUri(): string
    {
        return $this->uri;
    }

    public function getBody(): ?array
    {
        return $this->body;
    }

    public function getBodyParam(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function getQueryParam(string $key, mixed $default = null): mixed
    {
        return $this->queryParams[$key] ?? $default;
    }

    public function isMethod(string $method): bool
    {
        return $this->method === strtoupper($method);
    }

    public function isApi(): bool
    {
        return str_starts_with($this->uri, '/api');
    }
}
