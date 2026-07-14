<?php

namespace Controllers;

use Core\Database;
use Core\Response;
use Core\Auth;

/**
 * ApiController — now backed by a real SQLite database via PDO.
 *
 * All data is persisted in database/phpspa.sqlite.
 * The Database class auto-creates and seeds the DB on first boot.
 */
class ApiController
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Decode the JSON-encoded tags column and cast id to int.
     */
    private function hydrate(array $row): array
    {
        $row['id']   = (int) $row['id'];
        $row['tags'] = json_decode($row['tags'] ?? '[]', true) ?? [];
        return $row;
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    /**
     * GET /api/posts — Return all posts, newest first.
     */
    public function index(): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->query('SELECT * FROM posts ORDER BY date DESC');
        $rows = array_map([$this, 'hydrate'], $stmt->fetchAll());

        Response::json([
            'success' => true,
            'total'   => count($rows),
            'data'    => $rows,
        ]);
    }

    /**
     * GET /api/posts/:id — Return a single post by ID.
     */
    public function show(string $id): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('SELECT * FROM posts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => (int) $id]);
        $row  = $stmt->fetch();

        if (!$row) {
            Response::error("Post with id={$id} not found.", 404);
        }

        Response::json([
            'success' => true,
            'data'    => $this->hydrate($row),
        ]);
    }

    /**
     * POST /api/posts — Create a new post (persists to the database).
     *
     * Expected JSON body:
     *   { "title": "...", "excerpt": "...", "content": "...", "author": "...", "tags": ["..."] }
     */
    public function store(): void
    {
        $pdo  = Database::getInstance();
        $body = (new \Core\Request())->getBody() ?? [];

        // Basic validation
        $required = ['title', 'excerpt', 'content'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                Response::error("Missing required field: {$field}", 422);
            }
        }

        // The route is protected by 'auth' middleware, so Auth::user() will always return the payload here.
        $user = Auth::user();

        $stmt = $pdo->prepare("
            INSERT INTO posts (title, excerpt, content, author, tags, date)
            VALUES (:title, :excerpt, :content, :author, :tags, :date)
        ");

        $stmt->execute([
            ':title'   => trim($body['title']),
            ':excerpt' => trim($body['excerpt']),
            ':content' => trim($body['content']),
            ':author'  => $user['name'],
            ':tags'    => json_encode($body['tags'] ?? []),
            ':date'    => date('Y-m-d'),
        ]);

        $newId = (int) $pdo->lastInsertId();

        // Return the newly created post
        $stmt2 = $pdo->prepare('SELECT * FROM posts WHERE id = :id');
        $stmt2->execute([':id' => $newId]);
        $newPost = $this->hydrate($stmt2->fetch());

        Response::json([
            'success' => true,
            'message' => 'Post created successfully.',
            'data'    => $newPost,
        ], 201);
    }

    /**
     * PUT /api/posts/:id — Update an existing post.
     */
    public function update(string $id): void
    {
        $pdo  = Database::getInstance();
        $user = Auth::user(); // Route is protected by 'auth'

        // Check if post exists
        $stmt = $pdo->prepare('SELECT * FROM posts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => (int) $id]);
        $post = $stmt->fetch();

        if (!$post) {
            Response::error("Post with id={$id} not found.", 404);
        }

        // Check permissions: must be admin OR the author of the post
        if ($user['role'] !== 'admin' && $user['name'] !== $post['author']) {
            Response::error("Forbidden. You don't have permission to edit this post.", 403);
        }

        $body = (new \Core\Request())->getBody() ?? [];
        $required = ['title', 'excerpt', 'content'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                Response::error("Missing required field: {$field}", 422);
            }
        }

        $updateStmt = $pdo->prepare("
            UPDATE posts 
            SET title = :title, excerpt = :excerpt, content = :content, tags = :tags
            WHERE id = :id
        ");

        $updateStmt->execute([
            ':title'   => trim($body['title']),
            ':excerpt' => trim($body['excerpt']),
            ':content' => trim($body['content']),
            ':tags'    => json_encode($body['tags'] ?? []),
            ':id'      => (int) $id,
        ]);

        // Return the updated post
        $stmt->execute([':id' => (int) $id]);
        $updatedPost = $this->hydrate($stmt->fetch());

        Response::json([
            'success' => true,
            'message' => 'Post updated successfully.',
            'data'    => $updatedPost,
        ]);
    }

    /**
     * DELETE /api/posts/:id — Delete a post by ID.
     */
    public function destroy(string $id): void
    {
        $pdo  = Database::getInstance();
        $user = Auth::user(); // Route is protected by 'auth'

        // Check if post exists first to verify permissions
        $stmt = $pdo->prepare('SELECT * FROM posts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => (int) $id]);
        $post = $stmt->fetch();

        if (!$post) {
            Response::error("Post with id={$id} not found.", 404);
        }

        // Check permissions: must be admin OR the author of the post
        if ($user['role'] !== 'admin' && $user['name'] !== $post['author']) {
            Response::error("Forbidden. You don't have permission to delete this post.", 403);
        }

        $delStmt = $pdo->prepare('DELETE FROM posts WHERE id = :id');
        $delStmt->execute([':id' => (int) $id]);

        Response::json([
            'success' => true,
            'message' => "Post {$id} deleted.",
        ]);
    }

    /**
     * GET /api/tags — Return all unique tags across all posts.
     */
    public function tags(): void
    {
        $pdo  = Database::getInstance();
        $rows = $pdo->query('SELECT tags FROM posts')->fetchAll(\PDO::FETCH_COLUMN);

        $all = [];
        foreach ($rows as $json) {
            $decoded = json_decode($json, true) ?? [];
            foreach ($decoded as $tag) {
                $all[$tag] = ($all[$tag] ?? 0) + 1;
            }
        }

        arsort($all); // Sort by usage count descending

        Response::json([
            'success' => true,
            'data'    => array_map(
                fn($tag, $count) => ['tag' => $tag, 'count' => $count],
                array_keys($all),
                array_values($all)
            ),
        ]);
    }

    /**
     * GET /api/stats — Framework & runtime diagnostics.
     */
    public function stats(): void
    {
        $pdo   = Database::getInstance();
        $total = (int) $pdo->query('SELECT COUNT(*) FROM posts')->fetchColumn();

        // Get the SQLite file size
        $dbPath  = BASE_PATH . '/database/phpspa.sqlite';
        $dbSize  = file_exists($dbPath) ? round(filesize($dbPath) / 1024, 1) . ' KB' : 'N/A';

        Response::json([
            'success' => true,
            'data'    => [
                'framework'   => 'PhpSPA',
                'version'     => '1.0.0',
                'php_version' => PHP_VERSION,
                'sapi'        => PHP_SAPI,
                'database'    => 'SQLite (PDO)',
                'db_size'     => $dbSize,
                'total_posts' => $total,
                'timestamp'   => date('c'),
                'memory_peak' => round(memory_get_peak_usage(true) / 1024) . ' KB',
            ],
        ]);
    }
}
