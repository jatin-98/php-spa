/**
 * app.js — PhpSPA Entry Point
 *
 * Responsibilities:
 *  1. Theme management (light / dark, persisted in localStorage, no FOUC)
 *  2. SPA render engine (async-aware, spinner, fade-in transition)
 *  3. Route registration
 */

import { Router }       from './router.js';
import { Auth }         from './utils/auth.js';
import { Navbar }       from './components/Navbar.js';
import { HomePage }     from './pages/HomePage.js';
import { AboutPage }    from './pages/AboutPage.js';
import { PostPage }     from './pages/PostPage.js';
import { PostFormPage } from './pages/PostFormPage.js';
import { LoginPage }    from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// ── Theme Management ──────────────────────────────────────────────────────────

/**
 * Reads the saved theme preference from localStorage and applies it.
 * Called once on boot. The anti-FOUC inline script in index.html applies
 * the theme even earlier (before CSS loads), so this is a safety net.
 */
function initTheme() {
    const saved = localStorage.getItem('phpspa-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

/**
 * Toggle between 'dark' and 'light' themes.
 * - Persists the choice to localStorage.
 * - Updates the toggle button icon in-place (no full re-render).
 * - Plays a brief spin animation on the icon.
 */
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('phpspa-theme', next);

    // Update the button without re-rendering the entire navbar
    const btn  = document.getElementById('theme-toggle');
    if (btn) {
        const icon = btn.querySelector('.theme-toggle-icon');
        if (icon) {
            // Trigger animation by cycling the class
            btn.classList.remove('switching');
            void btn.offsetWidth; // force reflow so animation restarts
            btn.classList.add('switching');
            icon.textContent = next === 'dark' ? '☀️' : '🌙';
        }
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('title',      next === 'dark' ? 'Light mode'           : 'Dark mode');
    }
}

// ── Root element ──────────────────────────────────────────────────────────────
const app = document.getElementById('app');

// ── Spinner shown while async pages load ─────────────────────────────────────
const SPINNER = `
    <div class="main-content">
        <div class="page-loader">
            <div class="loader-ring"></div>
        </div>
    </div>
`;

// ── render() — the heart of the SPA ──────────────────────────────────────────
/**
 * Renders a page into #app.
 *  - Accepts a string (sync page) or a Promise<string> (async page).
 *  - Shows a spinner immediately while async pages fetch data.
 *  - Applies a CSS fade-in transition on every navigation.
 *  - Re-renders the Navbar so active-link + theme icon are always current.
 */
async function render(contentOrPromise) {
    const isAsync = contentOrPromise instanceof Promise;

    if (isAsync) {
        app.innerHTML = Navbar() + SPINNER;
    }

    const result = isAsync ? await contentOrPromise : contentOrPromise;

    // Support pages that return { html, init } instead of just a string
    const content = typeof result === 'string' ? result : result.html;
    const initFn  = typeof result === 'object' && result.init ? result.init : null;

    app.innerHTML = Navbar() + `<main class="main-content" id="main" tabindex="-1">${content}</main>`;

    if (initFn) {
        initFn();
    }

    // Trigger fade-in
    document.getElementById('main')?.classList.add('page-enter');

    // Scroll to top on every navigation (accessibility)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Global event delegation ───────────────────────────────────────────────────
// The navbar is re-rendered on every navigation, so we use event delegation
// on the document to catch the theme toggle click and logout click no matter when they appear.
document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
        toggleTheme();
    } else if (e.target.closest('#logout-btn')) {
        Auth.logout();
    }
});

// ── Router setup ──────────────────────────────────────────────────────────────
const router = new Router();

router
    .add('/',                ()   => render(HomePage()))
    .add('/about',           ()   => render(AboutPage()))
    .add('/login',           ()   => render(LoginPage()))
    .add('/register',        ()   => render(RegisterPage()))
    .add('/posts/create',    ()   => render(PostFormPage()))
    .add('/posts/edit/:id',  (id) => render(PostFormPage(id)))
    .add('/posts/:id',       (id) => render(PostPage(id)))
    .notFound(               ()   => render(NotFoundPage()));

// ── Bootstrap ─────────────────────────────────────────────────────────────────
initTheme();   // apply stored theme (safety net, index.html inline script is faster)
router.start();
