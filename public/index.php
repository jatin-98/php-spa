<?php

/**
 * public/index.php — PhpSPA Front Controller
 *
 * ALL requests enter here (Apache/Nginx rewrites everything to this file).
 *
 * Logic:
 *   - /api/* requests  → PHP Router → Controller → JSON response
 *   - everything else  → serve index.html (the SPA shell)
 */

define('BASE_PATH', dirname(__DIR__));

// ── Autoload core classes ─────────────────────────────────────────────────────
require_once BASE_PATH . '/app/Core/Request.php';
require_once BASE_PATH . '/app/Core/Response.php';
require_once BASE_PATH . '/app/Core/Router.php';
require_once BASE_PATH . '/app/Core/Database.php';
require_once BASE_PATH . '/app/Core/Auth.php';
require_once BASE_PATH . '/app/Controllers/ApiController.php';
require_once BASE_PATH . '/app/Controllers/AuthController.php';

use Core\Request;
use Core\Response;
use Core\Router;

// ── Handle CORS preflight (OPTIONS) ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
$request = new Request();

// Load API route definitions
require_once BASE_PATH . '/app/routes.php';

// ── Dispatch ─────────────────────────────────────────────────────────────────
if ($request->isApi()) {
    // PHP handles this — return JSON
    Router::dispatch($request);
} else {
    // Hand off to the Vanilla JS SPA
    header('Content-Type: text/html; charset=UTF-8');
    readfile(__DIR__ . '/index.html');
}
