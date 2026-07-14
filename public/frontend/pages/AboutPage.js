/**
 * AboutPage.js — About / Architecture Page (static, no API call)
 *
 * Explains how PhpSPA works end-to-end, with an animated request flow diagram.
 */
export function AboutPage() {
    return `
        <div class="page">

            <!-- ── Header ── -->
            <section class="about-header">
                <p class="eyebrow-label">The Framework</p>
                <h1 class="about-title">
                    How <span class="gradient-text">PhpSPA</span> Works
                </h1>
                <p class="about-subtitle">
                    A transparent look at every layer of the stack — from the Apache
                    rewrite rule to the JavaScript component that renders your UI.
                </p>
            </section>

            <!-- ── Request Flow ── -->
            <section class="flow-section" aria-label="Request flow diagram">
                <h2 class="flow-title">Request Flow</h2>
                <div class="flow-diagram" role="list">

                    <div class="flow-node" role="listitem">
                        <div class="flow-node-icon">🌐</div>
                        <div class="flow-node-body">
                            <strong>Browser</strong>
                            <span>Requests <code>/about</code></span>
                        </div>
                    </div>

                    <div class="flow-connector" aria-hidden="true">
                        <div class="flow-line"></div>
                        <div class="flow-arrow-head">▶</div>
                        <span class="flow-label">.htaccess rewrite</span>
                    </div>

                    <div class="flow-node" role="listitem">
                        <div class="flow-node-icon">🐘</div>
                        <div class="flow-node-body">
                            <strong>index.php</strong>
                            <span>Front controller — is this <code>/api/*</code>?</span>
                        </div>
                    </div>

                    <div class="flow-fork" aria-hidden="true">
                        <div class="fork-branch fork-no">
                            <span class="fork-label">No → serve HTML shell</span>
                        </div>
                        <div class="fork-branch fork-yes">
                            <span class="fork-label">Yes → PHP Router → Controller → JSON</span>
                        </div>
                    </div>

                    <div class="flow-node" role="listitem">
                        <div class="flow-node-icon">⚡</div>
                        <div class="flow-node-body">
                            <strong>JS Router</strong>
                            <span>Matches <code>/about</code> → renders <code>AboutPage</code></span>
                        </div>
                    </div>

                    <div class="flow-connector" aria-hidden="true">
                        <div class="flow-line"></div>
                        <div class="flow-arrow-head">▶</div>
                        <span class="flow-label">innerHTML update</span>
                    </div>

                    <div class="flow-node flow-node-end" role="listitem">
                        <div class="flow-node-icon">✅</div>
                        <div class="flow-node-body">
                            <strong>You see this page</strong>
                            <span>No full reload — SPA navigation</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── Feature Cards ── -->
            <section class="features-section" aria-label="Framework features">
                <h2 class="section-title">Core Features</h2>
                <div class="features-grid">
                    ${[
                        { icon: '🏗️', title: 'Front Controller Pattern', desc: 'Every HTTP request is routed through a single <code>index.php</code>. PHP decides: API call or SPA shell?' },
                        { icon: '🔀', title: 'PHP API Router', desc: 'Named route parameters (<code>:id</code>), HTTP method matching, and controller dispatch — 80 lines of Core PHP.' },
                        { icon: '📡', title: 'fetch() API Bridge', desc: 'The JS frontend talks to PHP exclusively via <code>/api/*</code> endpoints. Clean separation of concerns.' },
                        { icon: '🧭', title: 'History API Router', desc: 'Client-side navigation with <code>pushState</code>. Zero hash URLs. Supports browser back/forward and direct links.' },
                        { icon: '🧩', title: 'Component Functions', desc: 'Pages and components are plain JavaScript functions that return HTML strings. No framework, no virtual DOM.' },
                        { icon: '📦', title: 'ES Modules (No Bundler)', desc: '<code>type="module"</code> in the HTML. Native <code>import/export</code> in the browser. No Webpack or Vite needed.' },
                    ].map(f => `
                        <div class="feature-card">
                            <span class="feature-icon" aria-hidden="true">${f.icon}</span>
                            <h3 class="feature-title">${f.title}</h3>
                            <p class="feature-desc">${f.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- ── Stack Comparison ── -->
            <section class="comparison-section" aria-label="PhpSPA vs full frameworks">
                <h2 class="section-title">PhpSPA vs Full Frameworks</h2>
                <div class="comparison-table-wrap">
                    <table class="comparison-table" role="table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>PhpSPA</th>
                                <th>Laravel + React</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${[
                                ['Backend',     'Core PHP 8+',         'Laravel + Eloquent'],
                                ['Frontend',    'Vanilla JS (ESM)',    'React + JSX'],
                                ['Routing (BE)','Custom Router.php',  'Laravel Router'],
                                ['Routing (FE)','Custom router.js',   'React Router'],
                                ['Build step',  '❌ None required',   '✅ npm run build'],
                                ['Dependencies','❌ Zero',            '✅ Hundreds'],
                                ['Bundle size', '&lt;10 KB JS',      '100 KB+ JS'],
                                ['Learning',    '✅ See every line',  '⚠️ Abstraction layers'],
                            ].map(([f, a, b]) => `
                                <tr>
                                    <td>${f}</td>
                                    <td class="cell-phpspa">${a}</td>
                                    <td class="cell-framework">${b}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    `;
}
