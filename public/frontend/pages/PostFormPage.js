import { Auth } from '../utils/auth.js';

/**
 * PostFormPage.js
 *
 * Unified form for creating a new post or editing an existing one.
 * If an ID is provided, it fetches the existing post and populates the form.
 */
export async function PostFormPage(id = null) {
    if (!Auth.isLoggedIn()) {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return '';
    }

    let post = null;
    let fetchError = null;

    if (id) {
        try {
            const res = await fetch(`/api/posts/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            post = json.data;

            // Check if current user is authorized to edit this post
            if (!Auth.canEdit(post.author)) {
                window.history.pushState({}, '', `/posts/${id}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
                return '';
            }
        } catch (err) {
            fetchError = err.message;
        }
    }

    if (fetchError) {
        return `
            <div class="fetch-error" style="max-width: 600px; margin: 4rem auto;">
                <span class="fetch-error-icon">⚠️</span>
                <p>Could not load post: <strong>${fetchError}</strong></p>
                <a href="/" class="btn btn-ghost" style="margin-top: 1rem;">Back to Home</a>
            </div>
        `;
    }

    const titleText = id ? 'Edit Post' : 'Create Post';
    const btnText   = id ? 'Save Changes' : 'Publish Post';

    // Helper to safely inject existing data
    const val = (field) => post && post[field] ? post[field].replace(/"/g, '&quot;') : '';
    const tagsVal = post && post.tags ? post.tags.join(', ') : '';

    const html = `
        <div class="page form-page" style="max-width: 800px; margin: 0 auto;">
            <div class="section-header">
                <h1 class="section-title gradient-text">${titleText}</h1>
                <p class="section-sub">${id ? 'Update your post details below.' : 'Share something new with the world.'}</p>
            </div>

            <form id="post-form" class="card" style="padding: 2rem;">
                <div id="form-error" class="form-error" style="display: none;"></div>

                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required placeholder="My Awesome Post" value="${val('title')}" />
                </div>

                <div class="form-group">
                    <label for="excerpt">Excerpt (Short Summary)</label>
                    <input type="text" id="excerpt" name="excerpt" required placeholder="A brief description of this post..." value="${val('excerpt')}" />
                </div>

                <div class="form-group">
                    <label for="tags">Tags (Comma separated)</label>
                    <input type="text" id="tags" name="tags" placeholder="php, javascript, spa" value="${tagsVal}" />
                </div>

                <div class="form-group">
                    <label for="content">Content (Markdown supported)</label>
                    <textarea id="content" name="content" required placeholder="Write your post content here..." rows="12" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--r-md); border: 1px solid var(--border); background: rgba(0,0,0,0.2); color: var(--text-primary); font-family: var(--font-sans); font-size: 1rem; resize: vertical;">${val('content')}</textarea>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <a href="${id ? `/posts/${id}` : '/'}" class="btn btn-ghost">Cancel</a>
                    <button type="submit" class="btn btn-primary" id="submit-btn">
                        <span>${btnText}</span>
                    </button>
                </div>
            </form>
        </div>
    `;

    const init = () => {
        const form = document.getElementById('post-form');
        const errorDiv = document.getElementById('form-error');
        const btn = document.getElementById('submit-btn');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            btn.classList.add('loading');

            const title = form.title.value;
            const excerpt = form.excerpt.value;
            const content = form.content.value;
            // Parse tags from comma-separated string to array
            const tags = form.tags.value.split(',').map(t => t.trim()).filter(t => t);

            try {
                const endpoint = id ? `/api/posts/${id}` : '/api/posts';
                const method = id ? 'PUT' : 'POST';

                const res = await fetch(endpoint, {
                    method: method,
                    headers: Auth.headers(),
                    body: JSON.stringify({ title, excerpt, content, tags })
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error || 'Failed to save post');
                }

                // Redirect to the post page (either the new one or the updated one)
                const newId = id || json.data.id;
                window.history.pushState({}, '', `/posts/${newId}`);
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
