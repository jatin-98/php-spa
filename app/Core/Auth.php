<?php

namespace Core;

/**
 * Auth — Pure PHP JWT Authentication & Authorization.
 *
 * Implements JWT (HS256) entirely without external libraries.
 * A JWT is: base64url(header) . "." . base64url(payload) . "." . hmac_sha256_signature
 *
 * Usage:
 *   // Generate a token after login
 *   $token = Auth::generateToken(['sub' => 1, 'email' => 'a@b.com', 'role' => 'user']);
 *
 *   // In a protected route — fails with 401 JSON if invalid
 *   $payload = Auth::guard();
 *
 *   // In an admin-only route — fails with 403 JSON if not admin
 *   $payload = Auth::adminGuard();
 *
 *   // Soft check — returns null instead of terminating
 *   $payload = Auth::user();
 */
class Auth
{
    private static ?array $config = null;

    // ── Config ────────────────────────────────────────────────────────────────

    private static function config(): array
    {
        if (self::$config === null) {
            self::$config = require BASE_PATH . '/app/config.php';
        }
        return self::$config;
    }

    // ── Base64URL helpers ─────────────────────────────────────────────────────

    private static function b64encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64decode(string $data): string
    {
        $padded = $data . str_repeat('=', 4 - (strlen($data) % 4));
        return base64_decode(strtr($padded, '-_', '+/'));
    }

    // ── Token Generation ──────────────────────────────────────────────────────

    /**
     * Generate a signed JWT token.
     *
     * @param  array $payload  Claims to include (sub, email, role, etc.)
     * @return string          The signed JWT string.
     */
    public static function generateToken(array $payload): string
    {
        $config = self::config();

        $header  = self::b64encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = array_merge($payload, [
            'iat' => time(),
            'exp' => time() + $config['jwt_expires_in'],
        ]);
        $payload = self::b64encode(json_encode($payload));

        $signature = self::b64encode(
            hash_hmac('sha256', "{$header}.{$payload}", $config['jwt_secret'], true)
        );

        return "{$header}.{$payload}.{$signature}";
    }

    // ── Token Verification ────────────────────────────────────────────────────

    /**
     * Verify a JWT token.
     *
     * @param  string     $token  The raw JWT string.
     * @return array|null         Decoded payload array, or null if invalid/expired.
     */
    public static function verifyToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expected = self::b64encode(
            hash_hmac('sha256', "{$header}.{$payload}", self::config()['jwt_secret'], true)
        );

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        // Decode payload
        $data = json_decode(self::b64decode($payload), true);

        // Check expiry
        if (!is_array($data) || !isset($data['exp']) || $data['exp'] < time()) {
            return null;
        }

        return $data;
    }

    // ── Request Helpers ───────────────────────────────────────────────────────

    /** Extract the Bearer token from the Authorization header. */
    private static function getBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? apache_request_headers()['Authorization']
            ?? '';

        if (preg_match('/^Bearer\s+(.+)$/i', trim($header), $m)) {
            return $m[1];
        }

        return null;
    }

    // ── Guards ────────────────────────────────────────────────────────────────

    /**
     * Require a valid JWT. Sends 401 and exits if missing or invalid.
     *
     * @return array  Decoded token payload.
     */
    public static function guard(): array
    {
        $token = self::getBearerToken();

        if (!$token) {
            Response::error('Unauthenticated. No token provided.', 401);
        }

        $payload = self::verifyToken($token);

        if (!$payload) {
            Response::error('Unauthenticated. Invalid or expired token.', 401);
        }

        return $payload;
    }

    /**
     * Require a valid JWT with role === "admin". Sends 401/403 and exits otherwise.
     *
     * @return array  Decoded token payload.
     */
    public static function adminGuard(): array
    {
        $payload = self::guard(); // ensures 401 if not authenticated

        if (($payload['role'] ?? '') !== 'admin') {
            Response::error('Forbidden. Admin access required.', 403);
        }

        return $payload;
    }

    /**
     * Soft auth check — returns the payload or null. Never exits.
     * Use this when the endpoint is optional-auth.
     *
     * @return array|null
     */
    public static function user(): ?array
    {
        $token = self::getBearerToken();
        if (!$token) {
            return null;
        }
        return self::verifyToken($token);
    }
}
