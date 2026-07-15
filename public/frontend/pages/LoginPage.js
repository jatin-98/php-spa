import { Auth } from '../utils/auth.js';

/**
 * LoginPage.js
 *
 * Redesigned to match the site's glassmorphism design system:
 * — Split layout: decorative left panel + form right panel
 * — Gradient orb background glow
 * — Eyebrow pill badge, gradient heading
 * — Animated input focus ring
 */
export function LoginPage() {
    if (Auth.isLoggedIn()) {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return '';
    }

    const html = `
        <div class="auth-page">
            <!-- Background orbs -->
            <div class="auth-orb auth-orb-1"></div>
            <div class="auth-orb auth-orb-2"></div>

            <div class="auth-split">

                <!-- Left: Brand panel -->
                <div class="auth-panel-brand">
                    <a href="/" class="auth-brand-logo">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <path d="M18 3L33 12V24L18 33L3 24V12L18 3Z" stroke="url(#auth-grad)" stroke-width="2" fill="none"/>
                            <path d="M18 10L26 15V25L18 30L10 25V15L18 10Z" fill="url(#auth-grad)" opacity="0.3"/>
                            <circle cx="18" cy="18" r="3" fill="url(#auth-grad)"/>
                            <defs>
                                <linearGradient id="auth-grad" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
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
                            Zero Dependency Framework
                        </div>
                        <h2 class="auth-panel-title">Build SPAs with <span class="gradient-text">Core PHP</span> &amp; <span class="gradient-text-alt">Vanilla JS</span></h2>
                        <p class="auth-panel-sub">No Laravel. No React. No build tools. Just pure PHP and JavaScript.</p>

                        <div class="auth-panel-stats">
                            <div class="auth-stat">
                                <span class="auth-stat-value gradient-text">0</span>
                                <span class="auth-stat-label">npm packages</span>
                            </div>
                            <div class="auth-stat-sep"></div>
                            <div class="auth-stat">
                                <span class="auth-stat-value gradient-text">0</span>
                                <span class="auth-stat-label">Composer deps</span>
                            </div>
                            <div class="auth-stat-sep"></div>
                            <div class="auth-stat">
                                <span class="auth-stat-value gradient-text">100%</span>
                                <span class="auth-stat-label">Pure code</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Form panel -->
                <div class="auth-panel-form">
                    <div class="auth-form-wrap">
                        <div style="margin-bottom: 2rem;">
                            <h1 class="auth-form-title">Welcome back</h1>
                            <p class="auth-form-sub">Sign in to manage your posts</p>
                        </div>

                        <form id="login-form" autocomplete="on">
                            <div id="login-error" class="form-error" style="display: none;"></div>

                            <div class="form-group">
                                <label for="email">Email address</label>
                                <div class="input-wrap">
                                    <span class="input-icon">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                                        </svg>
                                    </span>
                                    <input type="email" id="email" name="email" required placeholder="admin@phpspa.com" autocomplete="email" />
                                </div>
                            </div>

                            <div class="form-group">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <label for="password" style="margin-bottom: 0;">Password</label>
                                </div>
                                <div class="input-wrap">
                                    <span class="input-icon">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                    </span>
                                    <input type="password" id="password" name="password" required placeholder="••••••••" autocomplete="current-password" />
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary auth-submit-btn" id="login-btn">
                                <span id="login-btn-text">Sign In</span>
                                <span id="login-btn-loader" style="display: none;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="auth-spinner">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                                        <path d="M12 2a10 10 0 0110 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                                    </svg>
                                    Signing in…
                                </span>
                            </button>
                        </form>

                        <div class="auth-divider">
                            <span>New to PhpSPA?</span>
                        </div>

                        <a href="/register" class="btn btn-ghost auth-alt-btn">
                            Create an account →
                        </a>

                        <p class="auth-demo-hint">
                            <span class="tag">Demo</span>
                            &nbsp; admin@phpspa.com &nbsp;/&nbsp; password
                        </p>
                    </div>
                </div>

            </div>
        </div>
    `;

    const init = () => {
        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('login-btn-text');
        const btnLoader = document.getElementById('login-btn-loader');

        if (!form) return;

        // Intercept SPA links inside the auth panel
        document.querySelectorAll('.auth-panel-form a[href], .auth-panel-brand a[href="/"]').forEach(link => {
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

            const email = form.email.value;
            const password = form.password.value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const json = await res.json();

                if (!res.ok) throw new Error(json.error || 'Login failed');

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
