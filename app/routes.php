<?php

/**
 * routes.php — API route definitions
 *
 * Register your API routes here. The $router variable is injected
 * from public/index.php before this file is included.
 *
 * Route format: $router->METHOD('/api/path/:param', 'Controller@method');
 */

use Core\Router;

// ── Posts ─────────────────────────────────────────────────────────────────────
Router::get('/api/posts',         'ApiController@index');    // GET    /api/posts
Router::get('/api/posts/:id',     'ApiController@show');     // GET    /api/posts/1
Router::post('/api/posts',        'ApiController@store');    // POST   /api/posts
Router::delete('/api/posts/:id',  'ApiController@destroy');  // DELETE /api/posts/1

// ── Tags ──────────────────────────────────────────────────────────────────────
Router::get('/api/tags',          'ApiController@tags');     // GET    /api/tags

// ── Meta ─────────────────────────────────────────────────────────────────────
Router::get('/api/stats',         'ApiController@stats');    // GET    /api/stats
