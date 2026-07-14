import { Auth } from '../utils/auth.js';

/**
 * LoginPage.js
 *
 * Renders the login form and handles submission.
 * We return both the HTML and an init() function so app.js can attach
 * event listeners after the HTML is injected into the DOM.
 */
export function LoginPage() {
    // If already logged in, redirect away
    if (Auth.isLoggedIn()) {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return '';
    }

    const html = `
        <div class="auth-container">
            <div class="card auth-card glow">
                <h1 class="gradient-text">Welcome Back</h1>
                <p class="text-muted">Sign in to manage your posts.</p>

                <form id="login-form" class="auth-form">
                    <div id="login-error" class="form-error" style="display: none;"></div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="admin@phpspa.com" />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required placeholder="••••••••" />
                    </div>

                    <button type="submit" class="btn btn-primary" id="login-btn">
                        <span>Sign In</span>
                    </button>
                </form>

                <p class="auth-footer">
                    Don't have an account? <a href="/register" class="nav-link" style="display: inline-block;">Register</a>
                </p>
            </div>
        </div>
    `;

    const init = () => {
        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            btn.classList.add('loading');

            const email = form.email.value;
            const password = form.password.value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error || 'Login failed');
                }

                Auth.login(json.token, json.user);
                
                // Trigger navigation to home
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));

            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.style.display = 'block';
            } finally {
                btn.classList.remove('loading');
            }
        });
    };

    return { html, init };
}
