<?php

/**
 * SeederInterface
 *
 * All database seeders must implement this interface.
 *
 * Example:
 *   class PostsSeeder implements SeederInterface {
 *       public function run(PDO $pdo): void {
 *           // insert rows...
 *       }
 *   }
 *
 * Run via CLI:
 *   php phpspa db:seed          — runs all seeders
 *   php phpspa db:seed Posts    — runs only PostsSeeder
 */
interface SeederInterface
{
    /**
     * Execute the seeder.
     *
     * @param PDO $pdo Active database connection.
     */
    public function run(PDO $pdo): void;
}
