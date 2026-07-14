/**
 * auth.js — Client-side Auth Utility
 *
 * Manages JWT token and user state in localStorage.
 * Import this wherever you need to read auth state or make authenticated requests.
 *
 * Usage:
 *   import { Auth } from '../utils/auth.js';
 *
 *   if (Auth.isLoggedIn()) { ... }
 *   const user = Auth.getUser();
 *   const headers = Auth.headers(); // adds Authorization: Bearer <token>
 */
export const Auth = {
    TOKEN_KEY: 'phpspa_token',
    USER_KEY:  'phpspa_user',

    /** Get the stored JWT string, or null. */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    /** Persist a token to localStorage. */
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },

    /** Get the stored user object, or null. */
    getUser() {
        const raw = localStorage.getItem(this.USER_KEY);
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    },

    /** Persist a user object to localStorage. */
    setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    /** Returns true if a token is stored (does NOT verify expiry client-side). */
    isLoggedIn() {
        return !!this.getToken();
    },

    /** Returns true if the stored user has the 'admin' role. */
    isAdmin() {
        return this.getUser()?.role === 'admin';
    },

    /** Remove token + user from storage (logout). */
    clear() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    /**
     * Returns headers suitable for an authenticated fetch() call.
     *
     * @example
     * fetch('/api/posts', { method: 'POST', headers: Auth.headers(), body: JSON.stringify(data) })
     */
    headers() {
        return {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${this.getToken()}`,
        };
    },

    /** Save both token and user at once (call this after a successful login/register). */
    login(token, user) {
        this.setToken(token);
        this.setUser(user);
    },

    /** Clear auth state and dispatch a global event so the Navbar can re-render. */
    logout() {
        this.clear();
        // Navigate to home via SPA router
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    },
};
