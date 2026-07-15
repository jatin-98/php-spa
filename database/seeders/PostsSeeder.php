<?php

require_once __DIR__ . '/SeederInterface.php';

/**
 * PostsSeeder — seeds the posts table with sample blog posts.
 *
 * Run via CLI:
 *   php phpspa db:seed
 *   php phpspa db:seed Posts
 */
class PostsSeeder implements SeederInterface
{
    public function run(PDO $pdo): void
    {
        echo "Seeding posts...\n";

        try {
            $pdo->query('SELECT 1 FROM posts LIMIT 1');
        } catch (PDOException $e) {
            die("Error: The 'posts' table does not exist. Run migrations first.\n");
        }

        $stmt = $pdo->prepare("
            INSERT INTO posts (title, excerpt, content, author, tags, date)
            VALUES (:title, :excerpt, :content, :author, :tags, :date)
        ");

        $data = [
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

        $count = 0;
        foreach ($data as $row) {
            $stmt->execute([
                ':title'   => $row['title'],
                ':excerpt' => $row['excerpt'],
                ':content' => $row['content'],
                ':author'  => $row['author'],
                ':tags'    => json_encode($row['tags']),
                ':date'    => $row['date'],
            ]);
            $count++;
        }

        echo "Seeded {$count} posts successfully.\n";
    }
}
