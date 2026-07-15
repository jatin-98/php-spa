import { Auth } from '../utils/auth.js';

/**
 * RegisterPage.js
 *
 * Redesigned to match the site's glassmorphism design system.
 * Mirrors the LoginPage split-panel layout.
 */
export function RegisterPage() {
    if (Auth.isLoggedIn()) {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return '';
    }

    const html = `
        <div class="auth-page">
            <!-- Background orbs -->
            <div class="auth-orb auth-orb-1" style="left: auto; right: -200px;"></div>
            <div class="auth-orb auth-orb-2" style="top: auto; bottom: -200px; left: 20%;"></div>

            <div class="auth-split auth-split-reversed">

                <!-- Right: Form panel (first on mobile) -->
                <div class="auth-panel-form">
                    <div class="auth-form-wrap">
                        <div style="margin-bottom: 2rem;">
                            <h1 class="auth-form-title">Create account</h1>
                            <p class="auth-form-sub">Join PhpSPA and start publishing</p>
                        </div>

                        <form id="register-form" autocomplete="on">
                            <div id="register-error" class="form-error" style="display: none;"></div>

                            <div class="form-group">
                                <label for="name">Full Name</label>
                                <div class="input-wrap">
                                    <span class="input-icon">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </span>
                                    <input type="text" id="name" name="name" required placeholder="John Doe" autocomplete="name" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="email">Email address</label>
                                <div class="input-wrap">
                                    <span class="input-icon">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                                        </svg>
                                    </span>
                                    <input type="email" id="email" name="email" required placeholder="john@example.com" autocomplete="email" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="password">Password</label>
                                <div class="input-wrap">
                                    <span class="input-icon">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                    </span>
                                    <input type="password" id="password" name="password" required minlength="8" placeholder="Min. 8 characters" autocomplete="new-password" />
                                </div>
                                <p class="form-hint">At least 8 characters</p>
                            </div>

                            <button type="submit" class="btn btn-primary auth-submit-btn" id="register-btn">
                                <span id="register-btn-text">Create Account</span>
                                <span id="register-btn-loader" style="display: none;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="auth-spinner">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                                        <path d="M12 2a10 10 0 0110 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                                    </svg>
                                    Creating account…
                                </span>
                            </button>
                        </form>

                        <div class="auth-divider">
                            <span>Already have an account?</span>
                        </div>

                        <a href="/login" class="btn btn-ghost auth-alt-btn">
                            Sign in instead →
                        </a>
                    </div>
                </div>

                <!-- Left: Brand panel -->
                <div class="auth-panel-brand">
                    <a href="/" class="auth-brand-logo">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <path d="M18 3L33 12V24L18 33L3 24V12L18 3Z" stroke="url(#auth-grad-r)" stroke-width="2" fill="none"/>
                            <path d="M18 10L26 15V25L18 30L10 25V15L18 10Z" fill="url(#auth-grad-r)" opacity="0.3"/>
                            <circle cx="18" cy="18" r="3" fill="url(#auth-grad-r)"/>
                            <defs>
                                <linearGradient id="auth-grad-r" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#8b5cf6"/>
                                    <stop offset="1" stop-color="#ec4899"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <span class="auth-brand-name">PhpSPA</span>
                    </a>

                    <div class="auth-panel-content">
                        <div class="hero-eyebrow" style="margin-bottom: 1.5rem;">
                            <span class="eyebrow-dot"></span>
                            Start Publishing Today
                        </div>
                        <h2 class="auth-panel-title">Everything you need to <span class="gradient-text">build and share</span></h2>
                        <p class="auth-panel-sub">Create posts, manage your content, and collaborate — all in one place.</p>

                        <ul class="auth-feature-list">
                            <li class="auth-feature-item">
                                <span class="auth-feature-check">✦</span>
                                Create and publish posts instantly
                            </li>
                            <li class="auth-feature-item">
                                <span class="auth-feature-check">✦</span>
                                Edit or remove your own content
                            </li>
                            <li class="auth-feature-item">
                                <span class="auth-feature-check">✦</span>
                                Tag posts for easy discovery
                            </li>
                            <li class="auth-feature-item">
                                <span class="auth-feature-check">✦</span>
                                Dark &amp; light mode, fully responsive
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    `;

    const init = () => {
        const form = document.getElementById('register-form');
        const errorDiv = document.getElementById('register-error');
        const btn = document.getElementById('register-btn');
        const btnText = document.getElementById('register-btn-text');
        const btnLoader = document.getElementById('register-btn-loader');

        if (!form) return;

        // Intercept SPA links
        document.querySelectorAll('.auth-page a[href]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/')) {
                    e.preventDefault();
                    window.history.pushState({}, '', href);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                }
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const name     = form.name.value;
            const email    = form.email.value;
            const password = form.password.value;

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const json = await res.json();

                if (!res.ok) throw new Error(json.error || 'Registration failed');

                Auth.login(json.token, json.user);
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));

            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        });
    };

    return { html, init };
}
