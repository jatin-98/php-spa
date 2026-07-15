# ⚡ PhpSPA

> A zero-dependency micro-framework: **Core PHP 8** REST API backend + **Vanilla JS** Single Page Application frontend.

No Laravel. No React. No npm. No Composer. Just pure PHP and JavaScript — every line written by you.

---

## Features

- ✅ **SPA Router** — client-side History API routing with named parameters
- ✅ **PHP REST API** — static-style routing (`Router::get()`) with a front controller
- ✅ **JWT Authentication** — pure PHP HS256 implementation, zero dependencies
- ✅ **Role-based Authorization** — `user` and `admin` roles
- ✅ **Modular Middleware** — interface-based, registered by name, infinitely extensible
- ✅ **Migration System** — versioned SQL migration files with batch rollbacks
- ✅ **Seeder Modules** — individual seeder classes, discoverable by the CLI
- ✅ **Dark / Light Theme** — persisted across sessions, smooth transitions
- ✅ **No build tools** — just a PHP server and a browser

---

## Project Structure

```
php-spa/
├── public/                        ← Web root (point your server here)
│   ├── index.php                  ← PHP front controller (ALL requests enter here)
│   ├── index.html                 ← SPA shell (served for non-API routes)
│   ├── style.css                  ← Design system (dark/light mode, glassmorphism)
│   ├── .htaccess                  ← Apache URL rewrite rules
│   └── frontend/                  ← Vanilla JS SPA (ES Modules, no bundler)
│       ├── app.js                 ← SPA bootstrap & render engine
│       ├── router.js              ← Client-side router (History API)
│       ├── utils/
│       │   └── auth.js            ← JWT storage & auth helpers (localStorage)
│       ├── components/
│       │   └── Navbar.js          ← Reactive navbar (user state, theme toggle)
│       └── pages/
│           ├── HomePage.js        ← Fetches & lists /api/posts
│           ├── AboutPage.js       ← Architecture overview
│           ├── PostPage.js        ← Single post view w/ Edit/Delete actions
│           ├── PostFormPage.js    ← Create & Edit post form (auth-gated)
│           ├── LoginPage.js       ← Login form
│           ├── RegisterPage.js    ← Registration form
│           └── NotFoundPage.js    ← 404 page
│
├── app/                           ← PHP application (NOT publicly accessible)
│   ├── Core/
│   │   ├── Router.php             ← API router — static syntax, middleware pipeline
│   │   ├── Auth.php               ← Pure PHP JWT (HS256) — sign, verify, guard
│   │   ├── Database.php           ← PDO singleton (SQLite)
│   │   ├── Request.php            ← HTTP request wrapper
│   │   ├── Response.php           ← JSON response helper
│   │   └── Middleware/
│   │       ├── MiddlewareInterface.php  ← Contract all middlewares must implement
│   │       ├── AuthMiddleware.php       ← Requires valid JWT
│   │       └── AdminMiddleware.php      ← Requires JWT + admin role
│   ├── Controllers/
│   │   ├── ApiController.php      ← Post CRUD endpoints
│   │   └── AuthController.php     ← /api/auth/register, /login, /me
│   ├── middleware.php             ← Middleware registry (name → class map)
│   ├── routes.php                 ← API route definitions
│   ├── config.php                 ← Secrets (JWT key, etc.) — gitignored
│   └── config.example.php        ← Template for config.php
│
├── database/
│   ├── migrations/                ← Versioned SQL schema files
│   │   ├── 001_create_posts_table.up.sql
│   │   ├── 001_create_posts_table.down.sql
│   │   ├── 002_create_users_table.up.sql
│   │   └── 002_create_users_table.down.sql
│   ├── seeders/                   ← Seeder classes (one per domain)
│   │   ├── SeederInterface.php    ← Contract all seeders must implement
│   │   ├── PostsSeeder.php        ← Seeds sample blog posts
│   │   └── UsersSeeder.php        ← Seeds demo admin + user accounts
│   └── phpspa.sqlite              ← SQLite database file (gitignored)
│
└── phpspa                         ← CLI tool (migrations, seeders)
```

---

## Quick Start

### 1. Clone & configure

```bash
git clone <repo-url> php-spa
cd php-spa
cp app/config.example.php app/config.php
# Edit app/config.php and set a strong JWT_SECRET
```

### 2. Run migrations & seed

```bash
php phpspa migrate
php phpspa db:seed
```

### 3. Start the dev server

```bash
php -S localhost:8000 -t public/
```

Open `http://localhost:8000` in your browser.

> **Note**: The PHP built-in server doesn't process `.htaccess`. It serves `index.php`
> for every request automatically, so client-side routing (History API) works perfectly.

### Option 2 — Apache / Nginx

Point your virtual host's document root at the `public/` directory.

**Apache** — enable `mod_rewrite` and `AllowOverride All`.

**Nginx** — add this to your server block:
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

---

## CLI Reference (`phpspa`)

```bash
# Migrations
php phpspa migrate              # Run all pending migrations
php phpspa migrate:rollback     # Roll back the last batch
php phpspa migrate:fresh        # Drop all tables and re-run all migrations

# Seeders
php phpspa db:seed              # Run ALL seeders in database/seeders/
php phpspa db:seed Posts        # Run only PostsSeeder
php phpspa db:seed Users        # Run only UsersSeeder
```

---

## API Endpoints

All API routes return JSON and live under `/api/*`.

| Method   | Endpoint               | Auth Required | Description                  |
|----------|------------------------|---------------|------------------------------|
| `GET`    | `/api/posts`           | —             | List all posts                |
| `GET`    | `/api/posts/:id`       | —             | Get a single post             |
| `POST`   | `/api/posts`           | `auth`        | Create a new post             |
| `PUT`    | `/api/posts/:id`       | `auth`        | Edit a post (author or admin) |
| `DELETE` | `/api/posts/:id`       | `auth`        | Delete a post (author or admin) |
| `POST`   | `/api/auth/register`   | —             | Register a new user           |
| `POST`   | `/api/auth/login`      | —             | Login, receive JWT            |
| `GET`    | `/api/auth/me`         | `auth`        | Get authenticated user info   |
| `GET`    | `/api/tags`            | —             | List all tags with counts     |
| `GET`    | `/api/stats`           | —             | Framework diagnostics         |

### Authentication

Authenticated endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by calling `POST /api/auth/login` with your email and password.

---

## Middleware System

Middleware is registered by name in `app/middleware.php` and referenced in route definitions.

### Registering a middleware

```php
// app/middleware.php
return [
    'auth'  => \Core\Middleware\AuthMiddleware::class,
    'admin' => \Core\Middleware\AdminMiddleware::class,
    'throttle' => \Core\Middleware\ThrottleMiddleware::class, // ← just add it here
];
```

### Creating a middleware

```php
// app/Core/Middleware/ThrottleMiddleware.php
namespace Core\Middleware;

use Core\Request;
use Core\Response;

class ThrottleMiddleware implements MiddlewareInterface
{
    public function handle(Request $request): void
    {
        // your logic here — call Response::error() to block
    }
}
```

### Using middleware on routes

```php
// app/routes.php
Router::get('/api/admin/report', 'AdminController@report', ['auth', 'admin']);
Router::post('/api/posts', 'ApiController@store', ['auth', 'throttle']);
```

Middlewares run in the order they are listed. An unknown name causes a `500` error.

---

## Migration System

Migrations live in `database/migrations/` as plain SQL files:

```
001_create_posts_table.up.sql    ← applied by migrate
001_create_posts_table.down.sql  ← applied by migrate:rollback
```

Create a new migration manually:
```bash
touch database/migrations/003_add_slug_to_posts.up.sql
touch database/migrations/003_add_slug_to_posts.down.sql
# Write your SQL, then:
php phpspa migrate
```

---

## Seeder System

Seeders live in `database/seeders/`. Each seeder is a class implementing `SeederInterface`:

```php
// database/seeders/TagsSeeder.php
class TagsSeeder implements SeederInterface
{
    public function run(PDO $pdo): void
    {
        // insert seed data...
        echo "Seeded tags.\n";
    }
}
```

The CLI auto-discovers all `*Seeder.php` files — no registration needed.

```bash
php phpspa db:seed          # runs TagsSeeder, PostsSeeder, UsersSeeder (alphabetical)
php phpspa db:seed Tags     # runs only TagsSeeder
```

---

## Adding a New API Route

1. Add a method to a controller in `app/Controllers/`.
2. Register the route in `app/routes.php`:
   ```php
   Router::get('/api/users/:id', 'UserController@show');
   Router::post('/api/users', 'UserController@store', ['auth']);
   ```

## Adding a New SPA Page

1. Create `public/frontend/pages/MyPage.js`:
   ```javascript
   export function MyPage() {
       return { html: `<div class="page"><h1>My Page</h1></div>`, init: () => {} };
   }
   ```
2. Import it in `public/frontend/app.js` and register the route:
   ```javascript
   import { MyPage } from './pages/MyPage.js';
   router.add('/my-page', () => render(MyPage()));
   ```

> **Page return format**: pages can return a plain HTML string or `{ html, init }` where
> `init()` is called after the HTML is injected into the DOM (useful for event listeners).

---

## How It Works

### Request Flow

```
Browser → GET /about
    │
    ├─ PHP built-in server / .htaccess → public/index.php
    │
    ├─ PHP checks: starts with /api?
    │     ├─ YES → middleware pipeline → Router → Controller → JSON
    │     └─ NO  → readfile('index.html')  (SPA shell)
    │
    └─ Browser executes app.js
           └─ JS Router matches /about → renders AboutPage()
```

### JWT Auth Flow

```
POST /api/auth/login  →  Auth::createToken()  →  JWT in response
         ↓
localStorage.setItem('phpspa_token', jwt)
         ↓
fetch('/api/posts', { headers: { Authorization: 'Bearer <jwt>' } })
         ↓
AuthMiddleware::handle()  →  Auth::guard()  →  Auth::user() returns payload
```

---

## Tech Stack

| Layer        | Technology                | Role                                   |
|--------------|---------------------------|----------------------------------------|
| Backend      | Core PHP 8+               | REST API (routing, controllers)        |
| Auth         | Pure PHP JWT (HS256)      | Stateless authentication               |
| Database     | SQLite via PDO            | Persistence, migrations                |
| Frontend     | Vanilla JS (ES Modules)   | SPA (routing, rendering)               |
| Styling      | Vanilla CSS               | Dark/light mode design system          |
| Transport    | `fetch()` / JSON          | Frontend ↔ Backend bridge              |
| Routing (BE) | Custom `Router.php`       | URI matching, middleware pipeline      |
| Routing (FE) | Custom `router.js`        | History API `pushState`                |

---

## Requirements

- PHP 8.0 or higher (with `pdo_sqlite` extension)
- A modern browser (Chrome, Firefox, Safari, Edge — all support ES Modules)
- Apache with `mod_rewrite` **or** the PHP built-in server

---

## Demo Accounts

After running `php phpspa db:seed`, these accounts are available:

| Email               | Password   | Role    |
|---------------------|------------|---------|
| `admin@phpspa.com`  | `password` | `admin` |
| `user@phpspa.com`   | `password` | `user`  |

**Permissions:**
- `user` — can create posts and edit/delete their own posts
- `admin` — can edit and delete any post

---

## License

MIT — do whatever you want with it.
