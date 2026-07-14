<?php

/**
 * app/config.example.php — Configuration Template
 *
 * Copy this file to app/config.php and fill in your values.
 * Run: cp app/config.example.php app/config.php
 *
 * Generate a secure JWT secret with:
 *   php -r "echo bin2hex(random_bytes(32));"
 */
return [
    'jwt_secret'     => 'REPLACE_WITH_A_LONG_RANDOM_STRING',
    'jwt_expires_in' => 3600 * 24 * 7, // 7 days
];
