<?php

/**
 * middleware.php — Middleware Registry
 *
 * Maps middleware names (used in route definitions) to their implementing classes.
 *
 * To add a new middleware:
 *   1. Create a class in app/Core/Middleware/ implementing MiddlewareInterface.
 *   2. Add it to this array: 'your-name' => YourMiddleware::class
 *
 * Usage in routes.php:
 *   Router::post('/api/posts', 'ApiController@store', ['auth']);
 *   Router::get('/api/admin/stats', 'AdminController@stats', ['auth', 'admin']);
 */

use Core\Middleware\AuthMiddleware;
use Core\Middleware\AdminMiddleware;

return [
    'auth'  => AuthMiddleware::class,
    'admin' => AdminMiddleware::class,
];
