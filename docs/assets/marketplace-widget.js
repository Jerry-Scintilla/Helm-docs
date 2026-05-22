/**
 * Helm Plugin Marketplace Widget
 * Fetches the curated plugin index from GitHub and renders plugin cards.
 * Runs on any page that contains <div id="helm-marketplace">.
 */
(function () {
  const INDEX_URL =
    "https://raw.githubusercontent.com/Jerry-Scintilla/helm-plugin-index/master/index.json";

  const isEn = document.documentElement.lang === "en";

  const T = {
    loading: isEn ? "Loading plugin index…" : "正在加载插件索引…",
    error: isEn
      ? "Failed to load the plugin index. Please check the GitHub repository directly."
      : "插件索引加载失败，请直接访问 GitHub 仓库查看。",
    empty: isEn ? "No plugins found." : "暂无插件。",
    verified: isEn ? "Verified" : "已验证",
    installed: isEn ? "Install" : "安装",
    source_pypi: "PyPI",
    source_testpypi: "TestPyPI",
    unknown_version: isEn ? "latest" : "最新",
    copy_tip: isEn ? "Copy install command" : "复制安装命令",
    copied: isEn ? "Copied!" : "已复制",
    homepage: isEn ? "Homepage" : "主页",
  };

  function badge(text, color) {
    return `<span style="
      display:inline-block;
      padding:1px 7px;
      border-radius:3px;
      font-size:0.72em;
      font-weight:600;
      line-height:1.6;
      background:${color};
      color:#fff;
      vertical-align:middle;
      margin-right:4px;
    ">${text}</span>`;
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCard(p) {
    const sourceColor = p.source === "testpypi" ? "#e67e22" : "#2980b9";
    const verifiedHtml = p.verified
      ? badge("✓ " + T.verified, "#27ae60")
      : "";
    const sourceHtml = badge(
      p.source === "testpypi" ? T.source_testpypi : T.source_pypi,
      sourceColor
    );
    const version = p.version || T.unknown_version;
    const tagsHtml = (p.tags || [])
      .map(
        (t) =>
          `<span style="
            display:inline-block;
            padding:1px 6px;
            border-radius:3px;
            font-size:0.7em;
            background:var(--md-code-bg-color,#f5f5f5);
            color:var(--md-default-fg-color--light,#555);
            margin:2px 2px 0 0;
          ">${escHtml(t)}</span>`
      )
      .join("");

    const installCmd = `pip install ${escHtml(p.package_name)}`;
    const homepageHtml = p.homepage
      ? `<a href="${escHtml(p.homepage)}" target="_blank" rel="noopener" style="font-size:0.82em;opacity:0.75;">
           ${T.homepage} ↗
         </a>`
      : "";

    return `<div class="hpm-card" data-pkg="${escHtml(p.package_name)}" style="
      border:1px solid var(--md-default-fg-color--lightest,#e0e0e0);
      border-radius:6px;
      padding:16px 18px;
      background:var(--md-default-bg-color,#fff);
      display:flex;
      flex-direction:column;
      gap:6px;
    ">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <span style="font-weight:700;font-size:1em;">${escHtml(p.display_name || p.package_name)}</span>
        <span style="font-size:0.78em;opacity:0.55;">v${escHtml(version)}</span>
        ${sourceHtml}${verifiedHtml}
      </div>
      ${p.description ? `<div style="font-size:0.88em;opacity:0.8;line-height:1.5;">${escHtml(p.description)}</div>` : ""}
      ${p.author ? `<div style="font-size:0.78em;opacity:0.55;">${escHtml(p.author)}</div>` : ""}
      ${tagsHtml ? `<div>${tagsHtml}</div>` : ""}
      <div style="
        display:flex;
        align-items:center;
        gap:8px;
        margin-top:4px;
        background:var(--md-code-bg-color,#f5f5f5);
        border-radius:4px;
        padding:5px 10px;
        font-family:var(--md-code-font,monospace);
        font-size:0.82em;
      ">
        <span style="flex:1;user-select:all;">${installCmd}</span>
        <button
          class="hpm-copy-btn"
          data-cmd="pip install ${escHtml(p.package_name)}"
          title="${T.copy_tip}"
          style="
            border:none;background:none;cursor:pointer;
            padding:2px 4px;border-radius:3px;
            color:var(--md-primary-fg-color,#2196f3);
            font-size:1em;
          "
        >⎘</button>
      </div>
      <div style="display:flex;justify-content:flex-end;">${homepageHtml}</div>
    </div>`;
  }

  function render(plugins, container) {
    if (!plugins.length) {
      container.innerHTML = `<p style="opacity:0.6">${T.empty}</p>`;
      return;
    }
    container.innerHTML = `<div style="
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
      gap:16px;
      margin-top:8px;
    ">${plugins.map(renderCard).join("")}</div>`;

    container.querySelectorAll(".hpm-copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.cmd).then(() => {
          const orig = btn.textContent;
          btn.textContent = T.copied;
          setTimeout(() => (btn.textContent = orig), 1500);
        });
      });
    });
  }

  function init() {
    const container = document.getElementById("helm-marketplace");
    if (!container) return;

    container.innerHTML = `<p style="opacity:0.6">${T.loading}</p>`;

    fetch(INDEX_URL)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => render(Array.isArray(data) ? data : [], container))
      .catch(() => {
        container.innerHTML = `<p style="color:var(--md-typeset-a-color,#f00);opacity:0.8">${T.error}</p>`;
      });
  }

  // MkDocs Material uses instant navigation — re-run on each page transition
  document.addEventListener("DOMContentLoaded", init);
  document$.subscribe && document$.subscribe(init);
})();
