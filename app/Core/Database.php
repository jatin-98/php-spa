<?php

namespace Core;

use PDO;
use PDOException;

/**
 * Database — PDO SQLite singleton.
 *
 * Returns a shared PDO instance connecting to database/phpspa.sqlite.
 * Auto-creates the database directory if it does not exist.
 *
 * Migrations are now managed by the `phpspa` CLI tool.
 */
class Database
{
    private static ?PDO $instance = null;

    /** Returns the shared PDO connection, creating it on first call. */
    public static function getInstance(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        // define BASE_PATH if it's not defined (e.g. running from a script outside index.php)
        if (!defined('BASE_PATH')) {
            define('BASE_PATH', dirname(__DIR__, 2));
        }

        $dbPath = BASE_PATH . '/database/phpspa.sqlite';
        $dbDir  = dirname($dbPath);

        // Ensure the database directory exists
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }

        try {
            self::$instance = new PDO('sqlite:' . $dbPath, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);

            self::$instance->exec('PRAGMA journal_mode=WAL;');
            self::$instance->exec('PRAGMA foreign_keys=ON;');

            // Ensure the migrations table exists to track which sql files have run
            self::$instance->exec("
                CREATE TABLE IF NOT EXISTS migrations (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    migration TEXT NOT NULL UNIQUE,
                    batch     INTEGER NOT NULL,
                    run_at    TEXT NOT NULL DEFAULT (datetime('now'))
                )
            ");

        } catch (PDOException $e) {
            if (PHP_SAPI === 'cli') {
                echo "Database error: " . $e->getMessage() . "\n";
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
            }
            exit(1);
        }

        return self::$instance;
    }
}
