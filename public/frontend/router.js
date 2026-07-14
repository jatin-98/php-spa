/**
 * router.js — Client-Side SPA Router
 *
 * Uses the HTML5 History API (pushState / popstate) to navigate between
 * pages without full browser reloads.
 *
 * Usage:
 *   const router = new Router();
 *   router
 *     .add('/', () => render(HomePage()))
 *     .add('/posts/:id', (id) => render(PostPage(id)))
 *     .notFound(() => render(NotFoundPage()));
 *   router.start();
 */
export class Router {
    constructor() {
        this.routes = [];
        this._notFoundHandler = null;

        // Browser back/forward buttons
        window.addEventListener('popstate', () => this._resolve());

        // Intercept ALL anchor clicks inside #app
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');

            // Only intercept same-origin, path-based links
            if (
                href &&
                (href.startsWith('/') || href.startsWith(window.location.origin)) &&
                !href.startsWith('/api') &&
                !anchor.hasAttribute('target')
            ) {
                e.preventDefault();
                this.navigate(href);
            }
        });
    }

    /**
     * Register a route.
     * @param {string}   path    - e.g. '/' or '/posts/:id'
     * @param {Function} handler - called with any captured params as arguments
     */
    add(path, handler) {
        this.routes.push({
            path,
            handler,
            regex: this._pathToRegex(path),
        });
        return this; // fluent API
    }

    /**
     * Register a fallback handler for unmatched routes.
     */
    notFound(handler) {
        this._notFoundHandler = handler;
        return this;
    }

    /**
     * Navigate programmatically to a new URL.
     */
    navigate(url) {
        history.pushState(null, null, url);
        this._resolve();
    }

    /**
     * Kick off the router (call once after registering all routes).
     */
    start() {
        this._resolve();
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _pathToRegex(path) {
        // Replace :param with a capture group that matches a path segment
        const pattern = path.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, '([^/]+)');
        return new RegExp(`^${pattern}$`);
    }

    _resolve() {
        const path = window.location.pathname;

        for (const route of this.routes) {
            const match = path.match(route.regex);
            if (match) {
                const params = match.slice(1); // drop the full-match group
                route.handler(...params);
                return;
            }
        }

        if (this._notFoundHandler) {
            this._notFoundHandler();
        }
    }
}
