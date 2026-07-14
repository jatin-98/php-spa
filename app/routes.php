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
Router::post('/api/posts',        'ApiController@store', ['auth']);   // POST   /api/posts
Router::delete('/api/posts/:id',  'ApiController@destroy', ['admin']); // DELETE /api/posts/1

// ── Auth ──────────────────────────────────────────────────────────────────────
Router::post('/api/auth/register', 'AuthController@register');
Router::post('/api/auth/login',    'AuthController@login');
Router::get('/api/auth/me',        'AuthController@me');

// ── Tags ──────────────────────────────────────────────────────────────────────
Router::get('/api/tags',          'ApiController@tags');     // GET    /api/tags

// ── Meta ─────────────────────────────────────────────────────────────────────
Router::get('/api/stats',         'ApiController@stats');    // GET    /api/stats
