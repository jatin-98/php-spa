<?php

require_once __DIR__ . '/SeederInterface.php';

/**
 * UsersSeeder — seeds the users table with a demo admin and a demo regular user.
 *
 * Run via CLI:
 *   php phpspa db:seed
 *   php phpspa db:seed Users
 */
class UsersSeeder implements SeederInterface
{
    public function run(PDO $pdo): void
    {
        echo "Seeding users...\n";

        try {
            $pdo->query('SELECT 1 FROM users LIMIT 1');
        } catch (PDOException $e) {
            die("Error: The 'users' table does not exist. Run migrations first.\n");
        }

        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        ");

        $users = [
            ['Admin User', 'admin@phpspa.com', 'password', 'admin'],
            ['Demo User',  'user@phpspa.com',  'password', 'user'],
        ];

        $count = 0;
        foreach ($users as $u) {
            // Skip if already seeded
            $check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
            $check->execute([$u[1]]);
            if (!$check->fetch()) {
                $stmt->execute([
                    $u[0],
                    $u[1],
                    password_hash($u[2], PASSWORD_BCRYPT, ['cost' => 12]),
                    $u[3],
                ]);
                $count++;
            } else {
                echo "Skipping {$u[1]} — already exists.\n";
            }
        }

        echo "Seeded {$count} user(s) successfully (password: 'password').\n";
    }
}
