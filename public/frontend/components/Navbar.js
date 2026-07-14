import { Auth } from '../utils/auth.js';

/**
 * Navbar.js — Persistent Navigation Component
 *
 * Renders the top navigation bar, including:
 *  - Brand logo + name
 *  - Page links with active-link detection
 *  - Auth links (Login/Register or User Menu)
 *  - API quick-link
 *  - Light / Dark theme toggle button
 *  - Stack pills
 */
export function Navbar() {
    const path    = window.location.pathname;
    const isDark  = document.documentElement.getAttribute('data-theme') !== 'light';
    const user    = Auth.getUser();

    const link = (href, label, extraClass = '') => {
        const isActive = path === href || (href !== '/' && path.startsWith(href));
        const cls = ['nav-link', isActive ? 'active' : '', extraClass].filter(Boolean).join(' ');
        return `<a href="${href}" class="${cls}">${label}</a>`;
    };

    return `
        <nav class="navbar" role="navigation" aria-label="Main navigation">
            <div class="navbar-inner">

                <!-- Brand -->
                <a href="/" class="navbar-brand" aria-label="PhpSPA Home">
                    <div class="brand-logo">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" stroke="url(#grad)" stroke-width="1.5" fill="none"/>
                            <circle cx="11" cy="11" r="3" fill="url(#grad)"/>
                            <defs>
                                <linearGradient id="grad" x1="2" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#8b5cf6"/>
                                    <stop offset="1" stop-color="#ec4899"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span class="brand-name">PhpSPA</span>
                </a>

                <!-- Links -->
                <div class="navbar-links" role="menubar">
                    ${link('/', 'Home')}
                    ${link('/about', 'About')}

                    <div class="nav-divider"></div>

                    ${user 
                        ? `
                           <div class="user-menu">
                               <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                               <span class="user-name">${user.name}</span>
                               ${user.role === 'admin' ? '<span class="role-badge">Admin</span>' : ''}
                               <button id="logout-btn" class="nav-link btn-logout">Logout</button>
                           </div>
                          `
                        : `
                           ${link('/login', 'Sign In')}
                           ${link('/register', 'Register', 'btn btn-primary btn-sm')}
                          `
                    }

                    <div class="nav-divider"></div>

                    <a href="/api/stats" target="_blank" rel="noopener" class="nav-link nav-api-link" title="Open raw JSON API">
                        API ↗
                    </a>
                </div>

                <!-- Right side: theme toggle + stack badge -->
                <div class="navbar-right">
                    <!-- Theme Toggle -->
                    <button
                        id="theme-toggle"
                        class="theme-toggle"
                        aria-label="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}"
                        title="${isDark ? 'Light mode' : 'Dark mode'}"
                        type="button"
                    >
                        <span class="theme-toggle-icon">${isDark ? '☀️' : '🌙'}</span>
                    </button>

                    <!-- Stack pills -->
                    <div class="navbar-stack-badge" aria-hidden="true">
                        <span class="stack-pill">🐘 PHP</span>
                        <span class="stack-sep">+</span>
                        <span class="stack-pill">⚡ JS</span>
                    </div>
                </div>

            </div>
        </nav>
    `;
}
