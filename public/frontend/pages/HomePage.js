/**
 * HomePage.js — Home Page Component
 *
 * Fetches all posts from the PHP API and renders a hero section + card grid.
 * Returns a Promise<string> because it makes an async fetch() call.
 */
export async function HomePage() {
    // ── Fetch posts from the PHP backend ──────────────────────────────────────
    let posts = [];
    let total = 0;
    let fetchError = null;

    try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        posts = json.data  ?? [];
        total = json.total ?? 0;
    } catch (err) {
        fetchError = err.message;
    }

    // ── Render ────────────────────────────────────────────────────────────────
    const postsHtml = fetchError
        ? `<div class="fetch-error">
               <span class="fetch-error-icon">⚠️</span>
               <p>Could not load posts: <strong>${fetchError}</strong></p>
               <small>Make sure the PHP server is running.</small>
           </div>`
        : posts.map(post => `
            <a href="/posts/${post.id}" class="post-card" aria-label="Read: ${post.title}">
                <div class="post-card-top">
                    <div class="post-tags">
                        ${(post.tags ?? []).map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <span class="post-date">${post.date}</span>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-footer">
                    <span class="post-author">
                        <span class="author-avatar">${post.author.charAt(0)}</span>
                        ${post.author}
                    </span>
                    <span class="post-cta">Read →</span>
                </div>
            </a>
        `).join('');

    return `
        <div class="page">

            <!-- ── Hero ── -->
            <section class="hero" aria-label="Hero section">
                <div class="hero-eyebrow">
                    <span class="eyebrow-dot"></span>
                    Zero-dependency micro-framework
                </div>
                <h1 class="hero-title">
                    Build SPAs with<br>
                    <span class="gradient-text">Core PHP</span> &amp;
                    <span class="gradient-text-alt">Vanilla JS</span>
                </h1>
                <p class="hero-subtitle">
                    No Laravel. No React. No build tools. Just a PHP front controller,
                    a JS History API router, and <code>fetch()</code>. That's it.
                </p>
                <div class="hero-actions">
                    <a href="/about" class="btn btn-primary">Explore the Architecture →</a>
                    <a href="/api/posts" target="_blank" rel="noopener" class="btn btn-ghost">View Raw API ↗</a>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat">
                        <span class="stat-value">0</span>
                        <span class="stat-label">npm packages</span>
                    </div>
                    <div class="hero-stat-sep" aria-hidden="true"></div>
                    <div class="hero-stat">
                        <span class="stat-value">0</span>
                        <span class="stat-label">composer packages</span>
                    </div>
                    <div class="hero-stat-sep" aria-hidden="true"></div>
                    <div class="hero-stat">
                        <span class="stat-value">100%</span>
                        <span class="stat-label">pure code</span>
                    </div>
                </div>
            </section>

            <!-- ── Posts ── -->
            <section class="posts-section" aria-label="Blog posts">
                <header class="section-header">
                    <h2 class="section-title">
                        Latest Posts
                        ${total ? `<span class="count-chip">${total}</span>` : ''}
                    </h2>
                    <p class="section-sub">Fetched live from <code>GET /api/posts</code> — served by PHP, rendered by JS.</p>
                </header>
                <div class="posts-grid">
                    ${postsHtml}
                </div>
            </section>

        </div>
    `;
}
