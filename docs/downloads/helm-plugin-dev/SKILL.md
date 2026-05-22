---
name: helm-plugin-dev
description: >
  Scaffold, implement, and locally test a complete Helm plugin for the EVE Online fleet
  management system at C:\Users\jerry\PycharmProjects\Helm. Use this skill whenever the
  user wants to create a new Helm plugin, add functionality via the plugin system, implement
  inter-plugin communication (ExtensionRegistry), add a new API endpoint or Celery task
  through a plugin, or asks "how do I make a plugin that does X". The skill interviews the
  user, generates every required file (pyproject.toml, plugin.py, router, tasks, migrations,
  frontend), and delivers ready-to-run local test commands. Trigger even if the user just
  describes a feature they want to add — if it belongs in a plugin, use this skill.
---

# Helm Plugin Developer

You are building a plugin for the **Helm** EVE Online fleet management system.

Helm's plugin system runs inside a shared virtualenv. Plugins can:
- Expose new REST endpoints (hot-mounted, no restart needed)
- Run Celery background tasks (worker needs soft-restart)
- Seed permissions, declare ESI scopes, inject sidebar menus
- Communicate with other plugins via **ExtensionRegistry**
- Run their own Alembic database migrations
- **Provide an iframe-based frontend (any tech stack) via HelmSDK postMessage**

SDK version in production: **1.0.0** · Compatibility declaration: `">=1.0,<2.0"`

Detailed API reference: `references/api.md` — read it when you need exact signatures.

---

## Frontend Architecture

Helm uses an **iframe + HelmSDK** frontend model.

- Plugin ships compiled static files (`frontend/dist/`) inside its Python package
- FastAPI serves them at `/plugin-ui/{name}/` (dynamic, no per-plugin mount needed)
- Helm wraps the plugin page in a `<iframe>` that fills the content area
- `HelmSDK` (`/plugin-sdk/helm-sdk.js`) is served by FastAPI and handles the postMessage handshake

**postMessage protocol:**

| Direction | type | payload |
|-----------|------|---------|
| iframe → parent | `helm:ready` | — |
| parent → iframe | `helm:init` | `{ token, apiBase }` |
| iframe → parent | `helm:navigate` | `{ route: string }` |
| iframe → parent | `helm:token:expired` | — |
| parent → iframe | `helm:token:refreshed` | `{ token }` |

**Plugin authors can use any frontend tech: plain HTML, Vue, React, etc.**

---

## Frontend Design Language

All plugin frontends **must** follow `Markdown/DESIGN.md`. This section is a condensed reference for plugin authors; do not invent colors or typography outside these tokens.

### Color Palette

Plugin UIs typically render in a **dark surface** context (the Helm shell is dark). Use dark-first layout by default.

#### Dark surface tokens (primary use case)
| Role | Token | Hex |
|------|-------|-----|
| Page background | Deep Dark | `#141413` |
| Elevated container | Dark Surface | `#30302e` |
| Primary text | Ivory | `#faf9f5` |
| Secondary text | Warm Silver | `#b0aea5` |
| Tertiary / metadata | Stone Gray | `#87867f` |
| Borders | Border Dark | `#30302e` |
| Primary CTA | Terracotta Brand | `#c96442` |
| CTA text | Ivory | `#faf9f5` |
| Error state | Error Crimson | `#b53333` |
| Error background | `#2a1a1a` | warm dark red tint |
| Focus ring | Focus Blue | `#3898ec` |

#### Light surface tokens (use when plugin content demands it)
| Role | Token | Hex |
|------|-------|-----|
| Page background | Parchment | `#f5f4ed` |
| Card surface | Ivory | `#faf9f5` |
| Primary text | Anthropic Near Black | `#141413` |
| Secondary text | Olive Gray | `#5e5d59` |
| Tertiary / metadata | Stone Gray | `#87867f` |
| Borders (light) | Border Cream | `#f0eee6` |
| Borders (prominent) | Border Warm | `#e8e6dc` |
| Secondary button bg | Warm Sand | `#e8e6dc` |
| Secondary button text | Charcoal Warm | `#4d4c48` |

> **Rule**: every gray must have a yellow-brown undertone. No cool blue-grays anywhere.

### Typography

Helm ships `Anthropic Serif`, `Anthropic Sans`, and `Anthropic Mono`. Always declare them with fallbacks:

```css
font-family: 'Anthropic Serif', Georgia, serif;        /* headings */
font-family: 'Anthropic Sans', system-ui, sans-serif;  /* body / UI */
font-family: 'Anthropic Mono', monospace;              /* code */
```

| Role | Family | Size | Weight | Line Height |
|------|--------|------|--------|-------------|
| Page / section title | Serif | 1.6rem (25.6px) | 500 | 1.20 |
| Card / widget title | Serif | 1.3rem (20.8px) | 500 | 1.20 |
| Body / UI text | Sans | 1rem (16px) | 400 | 1.60 |
| Secondary body | Sans | 0.94rem (15px) | 400 | 1.60 |
| Caption / metadata | Sans | 0.88rem (14px) | 400 | 1.43 |
| Table header | Sans | 0.8rem (12.8px) | 500 | 1.25 | + uppercase + 0.05em spacing |
| Code / terminal | Mono | 0.94rem (15px) | 400 | 1.60 |

**Never** use Serif at weight 700+. Weight 500 is the maximum for all serif headings.

### Component Patterns

#### Buttons
```css
/* Primary CTA */
.btn-primary {
  background: #c96442; color: #faf9f5;
  border-radius: 8px; padding: 8px 16px;
  box-shadow: #c96442 0px 0px 0px 0px, #c96442 0px 0px 0px 1px;
  border: none; font-family: 'Anthropic Sans', sans-serif; font-size: 1rem;
}

/* Secondary (dark surface) */
.btn-secondary {
  background: #30302e; color: #b0aea5;
  border-radius: 8px; padding: 8px 16px;
  box-shadow: #30302e 0px 0px 0px 0px, #4d4c48 0px 0px 0px 1px;
  border: none;
}

/* Secondary (light surface) */
.btn-secondary-light {
  background: #e8e6dc; color: #4d4c48;
  border-radius: 8px; padding: 0px 12px 0px 8px;
  box-shadow: #e8e6dc 0px 0px 0px 0px, #d1cfc5 0px 0px 0px 1px;
  border: none;
}
```

#### Cards & Containers
```css
.card {
  background: #30302e;                     /* dark surface */
  border: 1px solid #3d3d3a;
  border-radius: 8px;                      /* standard card */
  padding: 24px;
}
.card-featured {
  border-radius: 16px;                     /* elevated / hero card */
}
.card-shadow {
  box-shadow: rgba(0,0,0,0.05) 0px 4px 24px;
}
```

#### Tables
```css
table { width: 100%; border-collapse: collapse; }
th {
  color: #87867f; font-size: 0.8rem; text-transform: uppercase;
  letter-spacing: 0.05em; font-family: 'Anthropic Sans', sans-serif;
  font-weight: 500; padding: 8px 12px;
}
td { padding: 8px 12px; color: #b0aea5; }
tr { border-bottom: 1px solid #30302e; }
tr:last-child { border-bottom: none; }
```

#### Modals (replace `alert()` / `confirm()`)
```html
<!-- Use <dialog> or CSS overlay — never alert()/confirm() -->
<dialog id="confirm-modal" class="helm-modal">
  <p class="modal-message"></p>
  <div class="modal-actions">
    <button class="btn-primary" id="modal-ok">确认</button>
    <button class="btn-secondary" id="modal-cancel">取消</button>
  </div>
</dialog>
```
```css
.helm-modal {
  background: #30302e; color: #faf9f5;
  border: 1px solid #4d4c48; border-radius: 12px;
  padding: 24px; min-width: 320px;
}
.helm-modal::backdrop { background: rgba(0,0,0,0.6); }
```

#### Status / Badge chips
```css
.badge {
  display: inline-block; font-size: 0.75rem; font-weight: 500;
  padding: 2px 8px; border-radius: 24px;
  font-family: 'Anthropic Sans', sans-serif;
}
.badge-active   { background: rgba(201,100,66,0.15); color: #c96442; }
.badge-inactive { background: rgba(176,174,165,0.10); color: #87867f; }
.badge-error    { background: rgba(181,51,51,0.15); color: #b53333; }
```

#### Empty & Error states
```css
.empty-state {
  color: #5e5d59; padding: 48px 0; text-align: center;
  font-size: 0.94rem; font-family: 'Anthropic Sans', sans-serif;
}
.error-state {
  color: #b53333; background: #2a1a1a;
  border-radius: 8px; padding: 16px;
  font-family: 'Anthropic Sans', sans-serif;
}
```

### Design Do's & Don'ts

**Do:**
- Use `#141413` (Deep Dark) as dark page background — not `#000`, not `#1a1a1a`
- Use ring shadows (`0px 0px 0px 1px`) for interactive states instead of drop shadows
- Use Anthropic Serif weight 500 for all headings — never weight 700+
- Keep all grays warm-toned (yellow-brown undertone)
- Use generous body line-height 1.60
- Use `border-radius: 8px` for standard cards/buttons, `12px` for inputs, `16–32px` for hero containers
- Use `<dialog>` element for confirmation flows (sandbox blocks `confirm()`)

**Don't:**
- Don't use cool blue-grays — no `#6b7280`, `#9ca3af`, or similar
- Don't use `alert()`, `confirm()`, `prompt()`, or `window.open()` (sandbox-blocked)
- Don't use `#ffffff` as page background — use Parchment or Deep Dark
- Don't introduce saturated colors beyond Terracotta (`#c96442`)
- Don't use sharp corners (< 6px) on cards or buttons
- Don't use heavy drop shadows — prefer ring shadows

---

### Sandbox constraints (IMPORTANT)

Helm mounts the plugin iframe with `sandbox="allow-scripts allow-same-origin allow-forms"`.

**Browser console warning** — the browser always logs:
> "An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing."
This is structural and expected. Plugin developers cannot eliminate it.

**Blocked APIs** (missing `allow-modals` and `allow-popups`):
- `alert()`, `confirm()`, `prompt()` → **use `<dialog>` element or CSS overlay instead**
- `window.open()` → **use `HelmSDK.navigate()` or render content inline**

Never generate plugin frontend code that calls `alert()`, `confirm()`, `prompt()`, or `window.open()`. Always use in-page modal patterns.

---

## Step 1 — Interview (ask all at once, don't split into multiple questions)

Ask the user these questions in a single message before writing any code:

1. **Plugin name** — URL-slug style, e.g. `fleet-tracker`, `zkill-watcher` (permanent after install)
2. **One-line description** — what does it do?
3. **Capabilities needed** — which apply? (multiple allowed)
   - [ ] REST API endpoints
   - [ ] Celery background tasks
   - [ ] Database tables (own migrations)
   - [ ] ESI OAuth scopes
   - [ ] Sidebar menu item
   - [ ] Frontend pages (iframe, any tech — describe desired UI)
   - [ ] Respond to character/corporation data events
   - [ ] Inject widget cards or sub-pages into the character module (CharacterExtensionProvider / CharacterSubmodule)
   - [ ] Implement an ExtensionRegistry extension point (provide service to other plugins)
   - [ ] Consume an ExtensionRegistry extension point (use another plugin's service)
4. **Author name**
5. **If frontend**: describe the pages and data the plugin needs to show
6. **If ExtensionRegistry**: which extension point name?
7. **If character extension**: widget type (`stats` / `markdown` / `iframe`) or full sub-page (submodule)?

Pre-fill from the user's original request when possible.

---

## Step 2 — Confirm the plan

Before generating files, echo back a brief plan:

```
插件名:      {name}
功能:        {description}
生成内容:
  ✓ pyproject.toml
  ✓ {pkg_name}/plugin.py
  {if router}    ✓ {pkg_name}/routers.py
  {if tasks}     ✓ {pkg_name}/tasks.py
  {if models}    ✓ {pkg_name}/models.py + migrations/
  {if frontend}  ✓ {pkg_name}/frontend/dist/index.html（原生 HTML 示例）
  {if ext}       ✓ ExtensionRegistry 注册/消费代码
```

Ask "看起来对吗？还有什么要调整的？" before proceeding.

---

## Step 3 — Generate the full plugin package

Output every file as a fenced code block with its relative path as the title. Generate in dependency order: `pyproject.toml` → `plugin.py` → supporting modules → frontend.

### File: `pyproject.toml`

```toml
[project]
name = "helm-plugin-{name}"
version = "0.1.0"
description = "{description}"
requires-python = ">=3.12"
dependencies = []

[project.entry-points."helm.plugins"]
{name} = "{pkg_name}.plugin:{ClassName}Plugin"

[tool.setuptools.packages.find]
where = ["."]
```

If plugin has frontend, add:
```toml
[tool.setuptools.package-data]
{pkg_name} = ["frontend/dist/**"]
```

Rules:
- `pkg_name` = name with `-` → `_` (e.g. `fleet-tracker` → `fleet_tracker`)
- `ClassName` = PascalCase (e.g. `fleet-tracker` → `FleetTracker`)
- `dependencies = []` — all Helm packages already in the virtualenv
- Entry point group **must** be `"helm.plugins"`

### File: `{pkg_name}/__init__.py`

Empty file.

### File: `{pkg_name}/plugin.py`

```python
from pathlib import Path
from app.plugins.base import HelmPlugin, PluginContext, PermissionDef, SidebarItem

class {ClassName}Plugin(HelmPlugin):
    name = "{name}"
    version = "0.1.0"
    author = "{author}"
    description = "{description}"
    helm_sdk_version = ">=1.0,<2.0"
```

Add only the methods the user actually needs:

**If has router:**
```python
    def get_router(self):
        from {pkg_name}.routers import router
        return router
```

**If has tasks:**
```python
    def get_tasks(self) -> list[str]:
        return ["{pkg_name}.tasks"]
```

**If has scheduled (Beat) tasks:**
```python
    def get_beat_schedule(self) -> dict:
        # Structure matches Celery's native beat_schedule.
        # Keys are local entry names (unique within the plugin); Helm namespaces
        # them as "{name}:<key>" before injecting into the running Beat process.
        # "task" MUST be a task registered by one of get_tasks()' modules.
        return {
            "analyze-all": {
                "task": "{name}.analyze_all",   # the @celery_app.task name
                "schedule": 300.0,              # interval in seconds (float)
                "options": {"queue": "default"},
            },
        }
```

> Schedules are **hot-loaded** — installing/enabling the plugin pushes them to a
> Redis hash that `HelmBeatScheduler` polls each tick, so no Beat restart is
> needed. Disabling/uninstalling withdraws them. Admins can override each
> entry's interval at runtime from the task admin UI (`{name}:analyze-all`),
> exactly like built-in scheduled tasks. The worker must already have the task
> registered (it is, via `get_tasks()` + the install-time hot-registration
> broadcast), otherwise Beat will dispatch a task the worker rejects as
> unregistered.

**If has permissions:**
```python
    def get_permissions(self) -> list[PermissionDef]:
        return [
            PermissionDef("{name}.read",  "global", "读取数据"),
            PermissionDef("{name}.admin", "global", "管理数据"),
        ]
```

**If has ESI scopes:**
```python
    def get_esi_scopes(self) -> list[str]:
        return ["esi-{scope}.v1"]
```

**If has sidebar:**
```python
    def get_sidebar_items(self) -> list[SidebarItem]:
        return [SidebarItem("{label}", "/plugins/{name}", "{emoji}", order=200)]
```

**If has frontend:**
```python
    def get_static_dir(self):
        return Path(__file__).parent / "frontend" / "dist"

    def get_frontend_dev_url(self):
        return "http://localhost:5174"   # dev only; set to None before publishing
```

**If implements ExtensionRegistry point:**
```python
    def on_enable(self, ctx: PluginContext) -> None:
        from app.plugins.registry import extension_registry
        extension_registry.register("{point_name}", self, self.name)
```

**If has character submodule (sub-page inside character module):**
```python
    def get_character_submodules(self):
        from app.plugins.base import CharacterSubmodule
        base = self.get_frontend_dev_url() or f"/plugin-ui/{self.name}"
        return [
            CharacterSubmodule(
                slug="{slug}",
                label="{label}",
                icon="{emoji}",
                iframe_url_template=f"{base}/character/{{character_id}}/{slug}",
                order=10,
            )
        ]
```

> No need to register to ExtensionRegistry — Helm auto-serializes submodules on install/enable.

**If has character widget extension (stats/markdown/iframe card in character overview):**
```python
    def on_enable(self, ctx: PluginContext) -> None:
        from app.plugins.registry import extension_registry
        extension_registry.register("character.extension", self, self.name)

    async def get_character_extension(self, character_id: int, db):
        from app.plugins.base import CharacterExtension
        return CharacterExtension(
            character_id=character_id,
            title="{card_title}",
            widget="stats",   # "stats" | "markdown" | "iframe"
            content=[
                {"label": "指标", "value": 0},
            ],
            order=10,
        )
```

Import `CharacterExtensionProvider` when implementing widget extensions:
```python
from app.plugins.base import HelmPlugin, PluginContext, PermissionDef, SidebarItem, CharacterExtensionProvider, CharacterExtension

class {ClassName}Plugin(HelmPlugin, CharacterExtensionProvider):
    ...
```

### File: `{pkg_name}/routers.py` (only if has router)

```python
from fastapi import APIRouter, Depends
from app.core.permissions import require_permission

router = APIRouter()

@router.get("/{data_endpoint}")
async def list_items(page: int = 1, page_size: int = 20):
    # Return list or {"items": [...], "total": N}
    return []

@router.post("/{data_endpoint}")
async def create_item(
    payload: dict,
    _=Depends(require_permission("{name}.admin")),
):
    ...
    return {"message": "创建成功"}

@router.post("/{data_endpoint}/{item_id}")
async def action_item(item_id: int):
    ...
    return {"message": "操作成功"}

@router.delete("/{data_endpoint}/{item_id}")
async def delete_item(item_id: int):
    ...
```

Paths are relative to `/api/v1/plugins/{name}/`.

### File: `{pkg_name}/frontend/dist/index.html` (only if has frontend — plain HTML starter)

Generate a functional starter page that:
1. Loads HelmSDK: `<script src="/plugin-sdk/helm-sdk.js"></script>`
2. Calls `HelmSDK.init()` to receive the token
3. Makes at least one API call to the plugin's backend
4. Renders the response data

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>{label}</title>
  <script src="/plugin-sdk/helm-sdk.js"></script>
  <style>
    /* ── Design tokens (DESIGN.md — dark surface) ── */
    :root {
      --bg:          #141413;   /* Deep Dark */
      --surface:     #30302e;   /* Dark Surface */
      --border:      #3d3d3a;   /* Border Dark */
      --text-primary:#faf9f5;   /* Ivory */
      --text-body:   #b0aea5;   /* Warm Silver */
      --text-muted:  #87867f;   /* Stone Gray */
      --text-dim:    #5e5d59;   /* Olive Gray */
      --brand:       #c96442;   /* Terracotta Brand */
      --error-text:  #b53333;   /* Error Crimson */
      --error-bg:    #2a1a1a;
      --radius-sm:   8px;
      --radius-md:   12px;
      --radius-lg:   16px;
      --font-serif:  'Anthropic Serif', Georgia, serif;
      --font-sans:   'Anthropic Sans', system-ui, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text-body);
      padding: 24px 28px;
      line-height: 1.60;
    }

    h1 {
      font-family: var(--font-serif);
      font-size: 1.6rem;
      font-weight: 500;
      line-height: 1.20;
      color: var(--text-primary);
      margin-bottom: 20px;
    }

    /* Table */
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid var(--border); }
    tbody tr:last-child { border-bottom: none; }
    th {
      text-align: left; padding: 8px 12px;
      color: var(--text-muted); font-size: 0.8rem; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.05em;
      font-family: var(--font-sans);
    }
    td {
      text-align: left; padding: 10px 12px;
      color: var(--text-body); font-size: 0.94rem;
    }

    /* States */
    .empty-state {
      color: var(--text-dim); padding: 48px 0;
      text-align: center; font-size: 0.94rem;
    }
    .error-state {
      color: var(--error-text); background: var(--error-bg);
      border-radius: var(--radius-sm); padding: 16px;
    }

    /* Buttons */
    .btn-primary {
      background: var(--brand); color: var(--text-primary);
      border: none; border-radius: var(--radius-sm);
      padding: 8px 16px; cursor: pointer;
      font-family: var(--font-sans); font-size: 1rem;
      box-shadow: var(--brand) 0px 0px 0px 0px, var(--brand) 0px 0px 0px 1px;
    }
    .btn-primary:hover { opacity: 0.9; }

    /* Modal (replaces alert/confirm — sandbox-safe) */
    dialog.helm-modal {
      background: var(--surface); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 24px; min-width: 320px;
    }
    dialog.helm-modal::backdrop { background: rgba(0,0,0,0.6); }
    .modal-message { margin-bottom: 16px; font-size: 0.94rem; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
  </style>
</head>
<body>
  <h1>{label}</h1>
  <div id="root"><p class="empty-state">正在加载…</p></div>

  <!-- sandbox-safe confirm modal — never use alert()/confirm() -->
  <dialog id="confirm-modal" class="helm-modal">
    <p class="modal-message" id="modal-msg"></p>
    <div class="modal-actions">
      <button class="btn-primary" id="modal-ok">确认</button>
      <button style="background:var(--surface);color:var(--text-body);border:1px solid var(--border);border-radius:8px;padding:8px 16px;cursor:pointer" id="modal-cancel">取消</button>
    </div>
  </dialog>

  <script>
    HelmSDK.init(function (ctx) {
      fetch(ctx.apiBase + '/api/v1/plugins/{name}/{data_endpoint}', {
        headers: { Authorization: 'Bearer ' + HelmSDK.getToken() }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        })
        .then(function (data) {
          var items = Array.isArray(data) ? data : (data.items || [])
          if (items.length === 0) {
            document.getElementById('root').innerHTML = '<p class="empty-state">暂无数据</p>'
            return
          }
          var keys = Object.keys(items[0])
          var html = '<table><thead><tr>'
          keys.forEach(function (k) { html += '<th>' + k + '</th>' })
          html += '</tr></thead><tbody>'
          items.forEach(function (row) {
            html += '<tr>'
            keys.forEach(function (k) { html += '<td>' + (row[k] ?? '') + '</td>' })
            html += '</tr>'
          })
          html += '</tbody></table>'
          document.getElementById('root').innerHTML = html
        })
        .catch(function (err) {
          document.getElementById('root').innerHTML =
            '<div class="error-state">加载失败：' + err.message + '</div>'
        })
    })
  </script>
</body>
</html>
```

### File: `{pkg_name}/tasks.py` (only if has tasks)

```python
from app.tasks.celery_app import celery_app

@celery_app.task(name="{pkg_name}.{task_name}")
def {task_name}():
    ...
```

Worker needs soft-restart to pick up new tasks.

### File: `{pkg_name}/models.py` (only if has DB tables)

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import DeclarativeBase
from datetime import UTC, datetime

class Base(DeclarativeBase):
    pass   # Must NOT use Helm core's Base

class {ClassName}Record(Base):
    __tablename__ = "{name}_records"
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
```

### Files: `migrations/` (only if has DB tables)

**`migrations/alembic.ini`:**
```ini
[alembic]
script_location = %(here)s
sqlalchemy.url = postgresql+asyncpg://helm:helm@127.0.0.1:5432/helm
```

**`migrations/env.py`:**
```python
from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine
from {pkg_name}.models import Base
import asyncio

target_metadata = Base.metadata
config = context.config

async def run_migrations():
    engine = create_async_engine(config.get_main_option("sqlalchemy.url"))
    async with engine.begin() as conn:
        await conn.run_sync(context.configure, target_metadata=target_metadata, compare_type=True)
        await conn.run_sync(lambda conn: context.run_migrations())
    await engine.dispose()

asyncio.run(run_migrations())
```

**`migrations/versions/0001_initial.py`:**
```python
"""initial {name} tables"""
revision = "0001_{name_slug}"
down_revision = None
branch_labels = ("{name}",)

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table("{name}_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

def downgrade():
    op.drop_table("{name}_records")
```

---

## Step 4 — Deliver local test instructions

```markdown
## 本地测试步骤

### 1. 安装插件（editable 模式）
pip install -e ./helm-plugin-{name}

### 2. 通过管理 API 安装（后端运行中时执行）
curl -X POST http://localhost:8000/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "helm-plugin-{name}"}'

### 3. 验证安装状态
curl http://localhost:8000/api/v1/admin/plugins/{name}/status \
  -H "Authorization: Bearer <jwt>"
# 期望: {"status": "enabled", "is_loaded": true, "router_mounted": true}

### 4. 验证 API 端点
curl http://localhost:8000/api/v1/plugins/{name}/{first_endpoint} \
  -H "Authorization: Bearer <jwt>"

### 5. 验证前端（若有）
curl http://localhost:8000/plugin-sdk/helm-sdk.js   # 期望：200
curl http://localhost:8000/plugin-ui/{name}/index.html   # 期望：200

### 6. 打开前端验证
# 浏览器访问 http://localhost:5173/plugins/{name}
# 侧边栏应出现菜单项，内容区显示 iframe

### 7. 禁用 / 重新启用
curl -X POST http://localhost:8000/api/v1/admin/plugins/{name}/disable \
  -H "Authorization: Bearer <jwt>"
curl -X POST http://localhost:8000/api/v1/admin/plugins/{name}/enable \
  -H "Authorization: Bearer <jwt>"

### 8. 卸载
curl -X DELETE "http://localhost:8000/api/v1/admin/plugins/{name}?pip_remove=false" \
  -H "Authorization: Bearer <jwt>"
```

If Celery tasks, add:
```
### Celery worker 软重启
celery -A app.tasks.celery_app worker --loglevel=info
```

If frontend with dev server, add:
```
### 前端热重载
cd {pkg_name}/frontend && npm run dev
# → http://localhost:5174
# plugin.py 中 get_frontend_dev_url 返回该地址，Helm 自动指向 dev server
```

If ExtensionRegistry, add:
```
### 验证扩展点
from app.plugins.registry import extension_registry
print(extension_registry.list_points())
# 期望: {"{point_name}": ["{name}"]}
```

---

## Quality checklist (verify before finishing)

- [ ] `HelmPlugin.name` matches entry point key in `pyproject.toml`
- [ ] `helm_sdk_version = ">=1.0,<2.0"` is set
- [ ] No `from fastapi import FastAPI` — use `APIRouter` only
- [ ] Tasks use `from app.tasks.celery_app import celery_app`, not `Celery()`
- [ ] DB tables use plugin's own `Base`, never Helm core's
- [ ] Entry point: `{key} = "{module.path}:{ClassName}"` (colon, not dot)
- [ ] `SidebarItem.route` = `/plugins/{name}` (full path)
- [ ] If frontend: `get_static_dir()` returns `Path(__file__).parent / "frontend" / "dist"`
- [ ] If frontend: `dist/index.html` loads `/plugin-sdk/helm-sdk.js` and calls `HelmSDK.init()`
- [ ] If frontend: `pyproject.toml` includes `"frontend/dist/**"` in package-data
- [ ] If frontend dev URL set: remind user to set it to `None` before publishing
- [ ] If frontend: NO `alert()`, `confirm()`, `prompt()`, or `window.open()` — use `<dialog>` or CSS overlay
- [ ] If frontend: page background is `#141413` (Deep Dark), NOT `#000`, `#1a1a1a`, or `#1e1e1c`
- [ ] If frontend: all grays use warm-toned tokens (`#b0aea5`, `#87867f`, `#5e5d59`) — no cool blue-grays
- [ ] If frontend: headings use `font-family: 'Anthropic Serif', Georgia, serif` at `font-weight: 500`
- [ ] If frontend: body/UI text uses `font-family: 'Anthropic Sans', system-ui, sans-serif`
- [ ] If frontend: Terracotta (`#c96442`) used only for primary CTA — not decorative or secondary elements
- [ ] If frontend: buttons and cards use ring shadows (`0px 0px 0px 1px`) not heavy drop shadows
- [ ] If frontend: border-radius ≥ 6px on all interactive elements (8px standard, 12px for inputs)
- [ ] If frontend: CSS custom properties declared under `:root` using the canonical token names from DESIGN.md
- [ ] If character submodule: `iframe_url_template` contains `{character_id}` placeholder (literal braces in f-string: `{{character_id}}`)
- [ ] If character submodule: `slug` does not conflict with built-ins (`overview` `wallet` `skills` `assets` `mail` `notifications`)
- [ ] If character widget: class inherits both `HelmPlugin` AND `CharacterExtensionProvider`
- [ ] If character widget: `on_enable` registers to `"character.extension"` extension point
- [ ] No UISchema, PluginTable, or PluginForm references — those are removed
