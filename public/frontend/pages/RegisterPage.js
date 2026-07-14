import { Auth } from '../utils/auth.js';

export function RegisterPage() {
    if (Auth.isLoggedIn()) {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return '';
    }

    const html = `
        <div class="auth-container">
            <div class="card auth-card glow">
                <h1 class="gradient-text">Create Account</h1>
                <p class="text-muted">Join PhpSPA today.</p>

                <form id="register-form" class="auth-form">
                    <div id="register-error" class="form-error" style="display: none;"></div>

                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" required placeholder="John Doe" />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="john@example.com" />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required minlength="8" placeholder="••••••••" />
                        <small class="text-muted" style="display: block; margin-top: 0.25rem;">Must be at least 8 characters</small>
                    </div>

                    <button type="submit" class="btn btn-primary" id="register-btn">
                        <span>Sign Up</span>
                    </button>
                </form>

                <p class="auth-footer">
                    Already have an account? <a href="/login" class="nav-link" style="display: inline-block;">Log in</a>
                </p>
            </div>
        </div>
    `;

    const init = () => {
        const form = document.getElementById('register-form');
        const errorDiv = document.getElementById('register-error');
        const btn = document.getElementById('register-btn');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            btn.classList.add('loading');

            const name = form.name.value;
            const email = form.email.value;
            const password = form.password.value;

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error || 'Registration failed');
                }

                Auth.login(json.token, json.user);
                
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
