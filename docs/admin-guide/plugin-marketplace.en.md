# Plugin Marketplace

Helm includes a built-in plugin marketplace — a browsable, searchable catalog of official plugins with one-click installation from PyPI or TestPyPI.

---

## Marketplace UI

Navigate to **Admin Panel → Plugin Management → Marketplace** tab to access the marketplace.

**How it works:**

1. The system fetches the plugin list from a curated GitHub index (`marketplace_index_url`)
2. For entries missing version/author/description, metadata is automatically enriched from the appropriate registry (PyPI or TestPyPI)
3. The index is cached in Redis with a **6-hour** logical expiry (stale data is returned immediately while the cache refreshes in the background)
4. Administrators can click **Refresh Marketplace** to force-rebuild the index at any time

**Features:**

| Feature | Description |
|---------|-------------|
| Search | Fuzzy search by package name, display name, description, or tags |
| Source badge | Each plugin shows its registry source (PyPI / TestPyPI) and verification status |
| Install status | Already-installed plugins are marked to prevent duplicate installs |
| One-click install | Click Install to pull the package directly from the listed source |

**API Endpoints:**

```bash
# Search the marketplace (supports ?q= query)
curl "http://your-helm/api/v1/admin/plugins/marketplace/search?q=fleet" \
  -H "Authorization: Bearer <admin-token>"

# Force-refresh the marketplace index cache
curl -X POST http://your-helm/api/v1/admin/plugins/marketplace/refresh \
  -H "Authorization: Bearer <admin-token>"
```

---

## Quick Install Reference

In the Admin Panel → **Plugin Management**, you can browse and install from the marketplace UI, or install directly by package name.

```bash
# Install from PyPI (default)
curl -X POST http://your-helm/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "<package-name>", "source": "pypi"}'

# Install from TestPyPI
curl -X POST http://your-helm/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "<package-name>", "source": "testpypi"}'
```

For detailed steps, see [Plugin Management](plugins.md#install-a-plugin).

---

## Registered Plugins

The list below is fetched live from [helm-plugin-index](https://github.com/Jerry-Scintilla/helm-plugin-index) on every page load — no documentation rebuild needed to reflect newly registered plugins.

<div id="helm-marketplace"></div>

---

!!! tip "Building your own plugin?"
    See the [Plugin Development Guide](../plugin-dev/index.md) to learn how to build and publish plugins, and how to submit your plugin to the marketplace index. Download the [AI Scaffold Skill](../downloads.md) to generate a plugin skeleton with Claude Code in one step.
