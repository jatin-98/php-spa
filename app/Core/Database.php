<?php

namespace Core;

use PDO;
use PDOException;

/**
 * Database — PDO SQLite singleton.
 *
 * Auto-creates the database file, runs the schema migration, and seeds
 * initial data — all on the first connection. No manual setup required.
 *
 * Usage:
 *   $pdo = Database::getInstance();
 *   $rows = $pdo->query('SELECT * FROM posts')->fetchAll();
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

            self::migrate(self::$instance);

        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
            exit;
        }

        return self::$instance;
    }

    // ── Schema & Seed ─────────────────────────────────────────────────────────

    private static function migrate(PDO $pdo): void
    {
        // Create posts table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS posts (
                id        INTEGER  PRIMARY KEY AUTOINCREMENT,
                title     TEXT     NOT NULL,
                excerpt   TEXT     NOT NULL,
                content   TEXT     NOT NULL,
                author    TEXT     NOT NULL,
                tags      TEXT     NOT NULL DEFAULT '[]',
                date      TEXT     NOT NULL,
                created_at TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        ");

        // Seed if the table is empty
        $count = (int) $pdo->query('SELECT COUNT(*) FROM posts')->fetchColumn();

        if ($count === 0) {
            $stmt = $pdo->prepare("
                INSERT INTO posts (title, excerpt, content, author, tags, date)
                VALUES (:title, :excerpt, :content, :author, :tags, :date)
            ");

            foreach (self::seedData() as $row) {
                $stmt->execute([
                    ':title'   => $row['title'],
                    ':excerpt' => $row['excerpt'],
                    ':content' => $row['content'],
                    ':author'  => $row['author'],
                    ':tags'    => json_encode($row['tags']),
                    ':date'    => $row['date'],
                ]);
            }
        }
    }

    private static function seedData(): array
    {
        return [
            [
                'title'   => 'Getting Started with PhpSPA',
                'excerpt' => 'Learn how to set up your first project with Core PHP as the API backend and Vanilla JS as the SPA frontend.',
                'content' => "PhpSPA is a zero-dependency micro-framework that proves you don't need Laravel or React to build a modern single-page application. The PHP layer acts as a REST API, routing requests through a front-controller pattern to strongly-typed controller methods. The JavaScript layer intercepts link clicks, calls the History API, and renders components client-side — all without a build step.",
                'author'  => 'Alice Chen',
                'tags'    => ['PHP', 'SPA', 'Tutorial'],
                'date'    => '2026-07-01',
            ],
            [
                'title'   => 'Core PHP Routing Explained',
                'excerpt' => 'Deep dive into the front-controller pattern — how one PHP file can handle every request in your application.',
                'content' => 'Most PHP applications scatter logic across dozens of files, each mapped to a URL. A front controller flips this: every request enters through a single index.php, which decides what to do next. This is how Laravel, Symfony, and Slim work under the hood. In PhpSPA, the Router class uses preg_match with named capture groups to match URIs against registered routes, then instantiates the right controller and calls the right method.',
                'author'  => 'Bob Kumar',
                'tags'    => ['PHP', 'Architecture', 'Routing'],
                'date'    => '2026-07-05',
            ],
            [
                'title'   => 'Building SPAs Without Frameworks',
                'excerpt' => "You don't need React, Vue, or Angular to build a single-page application. Here's how the History API makes it possible.",
                'content' => "Modern browsers ship with the History API — window.history.pushState() — which lets you change the URL without reloading the page. Combined with a custom event listener that intercepts link clicks and a simple route-matching function, you have a fully functional client-side router in under 60 lines of JavaScript. PhpSPA's router.js does exactly this, with support for named route parameters like /posts/:id.",
                'author'  => 'Carol Okafor',
                'tags'    => ['JavaScript', 'SPA', 'History API'],
                'date'    => '2026-07-10',
            ],
            [
                'title'   => 'ES Modules: The Native JavaScript Module System',
                'excerpt' => 'Learn how type="module" in a script tag unlocks import/export in the browser — no bundler required.',
                'content' => 'Since 2017, all modern browsers support ES Modules natively. By adding type="module" to your script tag, you can use import and export statements directly in the browser. This is how PhpSPA structures its frontend: each page is a module, each component is a module, and the router wires them all together. No Webpack, no Rollup, no Vite — just a web server and a browser.',
                'author'  => 'David Park',
                'tags'    => ['JavaScript', 'ES Modules', 'Browser'],
                'date'    => '2026-07-12',
            ],
            [
                'title'   => 'Connecting PHP to SQLite with PDO',
                'excerpt' => 'Replace in-memory mock data with a real SQLite database — no MySQL server required, just a single file.',
                'content' => "SQLite is the world's most widely deployed database engine — it's a single file, requires zero configuration, and ships with PHP as the pdo_sqlite extension. PDO (PHP Data Objects) gives you a consistent API to query it safely with prepared statements. In PhpSPA, the Database class wraps PDO as a singleton: the first request auto-migrates the schema, seeds initial data, and returns a shared connection — no CLI setup needed.",
                'author'  => 'Eve Santos',
                'tags'    => ['PHP', 'SQLite', 'PDO', 'Database'],
                'date'    => '2026-07-14',
            ],
        ];
    }
}
