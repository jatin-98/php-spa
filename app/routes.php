<?php

/**
 * routes.php — API route definitions
 *
 * Register your API routes here. The $router variable is injected
 * from public/index.php before this file is included.
 *
 * Route format: $router->METHOD('/api/path/:param', 'Controller@method');
 */

// ── Posts ─────────────────────────────────────────────────────────────────────
$router->get('/api/posts',         'ApiController@index');    // GET    /api/posts
$router->get('/api/posts/:id',     'ApiController@show');     // GET    /api/posts/1
$router->post('/api/posts',        'ApiController@store');    // POST   /api/posts
$router->delete('/api/posts/:id',  'ApiController@destroy');  // DELETE /api/posts/1

// ── Tags ──────────────────────────────────────────────────────────────────────
$router->get('/api/tags',          'ApiController@tags');     // GET    /api/tags

// ── Meta ─────────────────────────────────────────────────────────────────────
$router->get('/api/stats',         'ApiController@stats');    // GET    /api/stats
