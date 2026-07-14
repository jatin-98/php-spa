/**
 * NotFoundPage.js — 404 Page Component
 */
export function NotFoundPage() {
    return `
        <div class="page page-centered">
            <div class="not-found-container">
                <div class="not-found-glow" aria-hidden="true"></div>
                <p class="not-found-code" aria-hidden="true">404</p>
                <h1 class="not-found-title">Page Not Found</h1>
                <p class="not-found-body">
                    The URL <code>${window.location.pathname}</code> doesn't match
                    any route in the SPA router.
                </p>
                <a href="/" class="btn btn-primary">← Back to Home</a>
            </div>
        </div>
    `;
}
