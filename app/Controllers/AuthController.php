<?php

namespace Controllers;

use Core\Auth;
use Core\Database;
use Core\Request;
use Core\Response;

/**
 * AuthController — Handles user registration, login, and profile.
 *
 * Routes:
 *   POST /api/auth/register  → register()
 *   POST /api/auth/login     → login()
 *   GET  /api/auth/me        → me()   [protected]
 */
class AuthController
{
    // ── Register ──────────────────────────────────────────────────────────────

    public function register(): void
    {
        $body = (new Request())->getBody() ?? [];

        // Validate required fields
        $required = ['name', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                Response::error("Missing required field: {$field}", 422);
            }
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email address.', 422);
        }

        if (strlen($body['password']) < 8) {
            Response::error('Password must be at least 8 characters.', 422);
        }

        $pdo = Database::getInstance();

        // Check for duplicate email
        $check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $check->execute([strtolower(trim($body['email']))]);
        if ($check->fetch()) {
            Response::error('An account with this email already exists.', 409);
        }

        // Insert the new user
        $stmt = $pdo->prepare('
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([
            trim($body['name']),
            strtolower(trim($body['email'])),
            password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]),
            'user', // new registrations are always 'user' role
        ]);

        $userId = (int) $pdo->lastInsertId();

        // Fetch the newly created user record
        $get = $pdo->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
        $get->execute([$userId]);
        $user       = $get->fetch();
        $user['id'] = (int) $user['id'];

        $token = Auth::generateToken([
            'sub'   => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        Response::json([
            'success' => true,
            'message' => 'Account created successfully.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function login(): void
    {
        $body = (new Request())->getBody() ?? [];

        if (empty($body['email']) || empty($body['password'])) {
            Response::error('Email and password are required.', 422);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([strtolower(trim($body['email']))]);
        $user = $stmt->fetch();

        // Verify password — use a dummy verify if user not found to prevent timing attacks
        $hash = $user['password_hash'] ?? '$2y$12$invalidhashusedtopreventtimingattacks00000000000000000';
        if (!$user || !password_verify($body['password'], $hash)) {
            Response::error('Invalid email or password.', 401);
        }

        $userData = [
            'id'         => (int) $user['id'],
            'name'       => $user['name'],
            'email'      => $user['email'],
            'role'       => $user['role'],
            'created_at' => $user['created_at'],
        ];

        $token = Auth::generateToken([
            'sub'   => $userData['id'],
            'name'  => $userData['name'],
            'email' => $userData['email'],
            'role'  => $userData['role'],
        ]);

        Response::json([
            'success' => true,
            'message' => 'Logged in successfully.',
            'token'   => $token,
            'user'    => $userData,
        ]);
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    public function me(): void
    {
        $payload = Auth::guard(); // 401 if not authenticated

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
        $stmt->execute([$payload['sub']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User not found.', 404);
        }

        $user['id'] = (int) $user['id'];

        Response::json(['success' => true, 'data' => $user]);
    }
}
