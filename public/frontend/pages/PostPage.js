import { Auth } from '../utils/auth.js';

/**
 * PostPage.js — Single Post Detail Page
 *
 * Fetches a single post by ID from GET /api/posts/:id
 * and renders a full article view with the raw API response shown at the bottom.
 *
 * @param {string} id - The post ID captured from the URL (/posts/:id)
 * @returns {Promise<{html: string, init: function}>} Object containing HTML string and init function
 */
export async function PostPage(id) {
    let post = null;
    let fetchError = null;

    try {
        const res = await fetch(`/api/posts/${id}`);
        const json = await res.json();

        if (!json.success) {
            throw new Error(json.error ?? 'Unknown error');
        }

        post = json.data;
    } catch (err) {
        fetchError = err.message;
    }

    // ── Post not found / error ────────────────────────────────────────────────
    if (fetchError || !post) {
        return {
            html: `
            <div class="page">
                <div class="post-detail-wrap">
                    <a href="/" class="back-link">← All Posts</a>
                    <div class="error-callout">
                        <span class="error-callout-icon">🔍</span>
                        <h1>Post Not Found</h1>
                        <p>${fetchError ?? 'This post does not exist.'}</p>
                        <a href="/" class="btn btn-primary" style="margin-top:1.5rem">← Back to Home</a>
                    </div>
                </div>
            </div>
        `,
            init: () => {}
        };
    }

    // ── Full article ──────────────────────────────────────────────────────────
    const tagsHtml = (post.tags ?? [])
        .map(t => `<span class="tag tag-lg">${t}</span>`)
        .join('');

    const canEdit = Auth.canEdit(post.author);
    const actionsHtml = canEdit
        ? `<div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border);">
               <a href="/posts/edit/${post.id}" class="btn btn-ghost">Edit Post</a>
               <button id="delete-post-btn" class="btn btn-ghost" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">Delete Post</button>
           </div>`
        : '';

    const html = `
        <div class="page">
            <div class="post-detail-wrap">

                <!-- Back link -->
                <a href="/" class="back-link">← All Posts</a>

                <!-- Article header -->
                <article class="post-article" aria-label="${post.title}">
                    <header class="post-article-header">
                        <div class="post-tags">${tagsHtml}</div>
                        <h1 class="post-article-title">${post.title}</h1>
                        <div class="post-article-meta">
                            <span class="post-author">
                                <span class="author-avatar">${post.author.charAt(0)}</span>
                                ${post.author}
                            </span>
                            <span class="meta-sep" aria-hidden="true">·</span>
                            <time datetime="${post.date}">${post.date}</time>
                        </div>
                    </header>

                    <!-- Content -->
                    <div class="post-article-body">
                        <p class="post-lead">${post.excerpt}</p>
                        <p>${post.content}</p>
                        <p>
                            This page was rendered entirely client-side by Vanilla JavaScript.
                            The content was fetched from the PHP API at
                            <code>GET /api/posts/${post.id}</code> using the
                            browser's native <code>fetch()</code> API — no libraries involved.
                        </p>
                    </div>
                    
                    ${actionsHtml}
                </article>

                <!-- Raw API response (educational) -->
                <div class="api-response-box">
                    <div class="api-response-header">
                        <span class="api-badge">PHP API Response</span>
                        <code class="api-endpoint">GET /api/posts/${post.id}</code>
                    </div>
                    <pre class="api-response-body"><code>${JSON.stringify(post, null, 2)}</code></pre>
                </div>

                <!-- Nav between posts -->
                <div class="post-nav">
                    ${post.id > 1
                        ? `<a href="/posts/${post.id - 1}" class="btn btn-ghost">← Previous Post</a>`
                        : `<span></span>`
                    }
                    <a href="/" class="btn btn-ghost">All Posts</a>
                    <a href="/posts/${post.id + 1}" class="btn btn-ghost">Next Post →</a>
                </div>

            </div>
        </div>
    `;

    const init = () => {
        if (!canEdit) return;
        
        const deleteBtn = document.getElementById('delete-post-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
                
                deleteBtn.disabled = true;
                deleteBtn.textContent = 'Deleting...';
                
                try {
                    const res = await fetch(`/api/posts/${post.id}`, {
                        method: 'DELETE',
                        headers: Auth.headers()
                    });
                    
                    if (!res.ok) {
                        const json = await res.json();
                        throw new Error(json.error || 'Failed to delete');
                    }
                    
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                } catch (err) {
                    alert('Error: ' + err.message);
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = 'Delete Post';
                }
            });
        }
    };

    return { html, init };
}
