---
hide:
  - navigation
  - toc
---

<div class="helm-hero" markdown>

# ⚓ Helm

<p class="lead">Open-Source EVE Online Fleet Management Platform</p>
<p class="tagline">Plugin Architecture · RBAC · Real-time ESI Sync · Hot-reload Extensions</p>

<div class="btn-row" markdown>
[Get Started](getting-started/index.md){ .md-button .md-button--primary }
[Plugin Dev](plugin-dev/index.md){ .md-button }
[GitHub](https://github.com/Jerry-Scintilla/helm){ .md-button }
</div>

</div>

## Core Features

<div class="feature-grid" markdown>

<div class="feature-card" markdown>
<span class="icon">🔐</span>
### EVE SSO Authentication
Single sign-on via CCP's official OAuth 2.0. Supports multiple character bindings and programmatic API token access — no separate account system needed.
</div>

<div class="feature-card" markdown>
<span class="icon">📡</span>
### Real-time ESI Data Sync
Automatically pulls character skills, assets, wallet, mail, and notifications via the EVE Swagger Interface, with bucket-based rate limiting.
</div>

<div class="feature-card" markdown>
<span class="icon">🛡️</span>
### Fine-grained RBAC
Four-dimensional permission system: global, character, corporation, and alliance levels. Plugins can declare custom permission nodes that are automatically registered on install.
</div>

<div class="feature-card" markdown>
<span class="icon">🔌</span>
### Hot-reload Plugin System
Python wheel-based plugin architecture. Install, enable, or disable plugins without restarting the API service. Plugins can register routes, tasks, permissions, and frontend pages.
</div>

<div class="feature-card" markdown>
<span class="icon">⚙️</span>
### Async Task Queue
Celery + Redis-powered background task system supporting scheduled ESI sync, custom plugin tasks, and task run history tracking.
</div>

<div class="feature-card" markdown>
<span class="icon">🏗️</span>
### Modern Tech Stack
FastAPI backend + Vue 3 / Naive UI frontend, PostgreSQL persistence, Alembic migrations, and asyncio throughout.
</div>

</div>

## Quick Navigation

| I am… | Start here |
|-------|------------|
| **An admin deploying for the first time** | [Installation](getting-started/index.md) → [Configuration Reference](getting-started/configuration.md) |
| **A fleet member using the platform** | [User Guide](user-guide/index.md) → [EVE SSO Login](user-guide/authentication.md) |
| **A site admin managing plugins** | [Admin Guide](admin-guide/index.md) → [Plugin Management](admin-guide/plugins.md) |
| **A developer building custom plugins** | [Plugin Dev Guide](plugin-dev/index.md) → [Download AI Scaffold Skill](downloads.md) |
| **A tool developer integrating the API** | [API Reference](api-reference/index.md) |

---

!!! note "About EVE Online"
    Helm is an independent player tool for EVE Online and is not affiliated with or endorsed by CCP Games. EVE Online and related content are trademarks of CCP Games.
