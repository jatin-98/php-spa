# ⚡ PhpSPA

> A zero-dependency micro-framework: **Core PHP 8** REST API backend + **Vanilla JS** Single Page Application frontend.

No Laravel. No React. No npm. No Composer. Just pure PHP and JavaScript — every line written by you.

---

## Project Structure

```
php-spa/
├── public/                   ← Web root (point your server here)
│   ├── index.php             ← PHP front controller (ALL requests enter here)
│   ├── index.html            ← SPA shell (served for non-API routes)
│   ├── style.css             ← Design system (dark mode, glassmorphism)
│   ├── .htaccess             ← Apache URL rewrite rules
│   └── frontend/             ← Vanilla JS SPA (ES Modules)
│       ├── app.js            ← SPA bootstrap & render engine
│       ├── router.js         ← Client-side router (History API)
│       ├── components/
│       │   └── Navbar.js
│       └── pages/
│           ├── HomePage.js   ← Fetches /api/posts
│           ├── AboutPage.js  ← Static architecture overview
│           ├── PostPage.js   ← Fetches /api/posts/:id
│           └── NotFoundPage.js
│
└── app/                      ← PHP application (NOT publicly accessible)
    ├── Core/
    │   ├── Router.php        ← API router (method + URI matching)
    │   ├── Request.php       ← HTTP request wrapper
    │   └── Response.php      ← JSON response helper
    ├── Controllers/
    │   └── ApiController.php ← Demo CRUD endpoints (mock data)
    └── routes.php            ← API route definitions
```

---

## Quick Start

### Option 1 — PHP Built-in Server (Recommended for development)

```bash
cd php-spa
php -S localhost:8000 -t public/
```

Open `http://localhost:8000` in your browser.

> **Note**: The PHP built-in server doesn't process `.htaccess`. It serves `index.php`
> for every request automatically, so client-side routing (History API) works perfectly.

### Option 2 — Apache / Nginx

Point your virtual host's document root at the `public/` directory.
The `.htaccess` file handles URL rewriting.

**Apache** — enable `mod_rewrite` and `AllowOverride All`.

**Nginx** — add this to your server block:
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

---

## API Endpoints

All API routes return JSON and live under `/api/*`.

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/posts`      | List all posts           |
| GET    | `/api/posts/:id`  | Get a single post        |
| POST   | `/api/posts`      | Create a post (demo)     |
| GET    | `/api/stats`      | Framework diagnostics    |

Try it: `http://localhost:8000/api/posts`

---

## How It Works

### Request Flow

```
Browser → GET /about
    │
    ├─ .htaccess rewrites to → public/index.php
    │
    ├─ PHP checks: starts with /api?
    │     ├─ YES → Router → ApiController → JSON response
    │     └─ NO  → readfile('index.html')  (SPA shell)
    │
    └─ Browser executes app.js
           └─ JS Router matches /about → renders AboutPage()
```

### Adding a New API Route

1. Add a method to `app/Controllers/ApiController.php` (or create a new controller).
2. Register the route in `app/routes.php`:
   ```php
   $router->get('/api/users/:id', 'UserController@show');
   ```

### Adding a New SPA Page

1. Create `public/frontend/pages/MyPage.js`:
   ```javascript
   export function MyPage() {
       return `<div class="page"><h1>My Page</h1></div>`;
   }
   ```
2. Import it in `public/frontend/app.js` and register the route:
   ```javascript
   import { MyPage } from './pages/MyPage.js';
   router.add('/my-page', () => render(MyPage()));
   ```

---

## Tech Stack

| Layer        | Technology            | Role                            |
|--------------|-----------------------|---------------------------------|
| Backend      | Core PHP 8+           | REST API (routing, controllers) |
| Frontend     | Vanilla JS (ESM)      | SPA (routing, rendering)        |
| Styling      | Vanilla CSS           | Dark mode design system         |
| Transport    | `fetch()` / JSON      | Frontend ↔ Backend bridge       |
| Routing (BE) | Custom `Router.php`   | URI matching, dispatch          |
| Routing (FE) | Custom `router.js`    | History API pushState           |

---

## Requirements

- PHP 8.0 or higher
- A modern browser (Chrome, Firefox, Safari, Edge — all support ES Modules)
- Apache with `mod_rewrite` (or use the PHP built-in server)

---

## License

MIT — do whatever you want with it.
