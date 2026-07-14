<?php

namespace Core;

/**
 * HTTP Response helper.
 * Sends JSON responses with proper headers and terminates execution.
 */
class Response
{
    /**
     * Send a JSON response and exit.
     *
     * @param mixed $data    The data to encode as JSON.
     * @param int   $status  HTTP status code (default 200).
     */
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);

        // CORS headers — allow the SPA to call the API from any origin
        header('Content-Type: application/json; charset=UTF-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('X-Powered-By: PhpSPA/1.0');

        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Convenience wrapper: send a successful envelope.
     *
     * @param mixed  $data
     * @param string $message
     * @param int    $status
     */
    public static function success(mixed $data, string $message = 'OK', int $status = 200): never
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Convenience wrapper: send an error envelope.
     *
     * @param string $error
     * @param int    $status
     */
    public static function error(string $error, int $status = 400): never
    {
        self::json([
            'success' => false,
            'error'   => $error,
        ], $status);
    }
}
