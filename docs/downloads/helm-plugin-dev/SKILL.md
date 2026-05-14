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
   - [ ] Implement an ExtensionRegistry extension point (provide service to other plugins)
   - [ ] Consume an ExtensionRegistry extension point (use another plugin's service)
4. **Author name**
5. **If frontend**: describe the pages and data the plugin needs to show
6. **If ExtensionRegistry**: which extension point name?

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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #1e1e1c;
      color: #b0aea5;
      padding: 24px 28px;
    }
    h1 { color: #f5f4ed; font-size: 1.4rem; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #30302e; }
    th { color: #87867f; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .empty { color: #5e5d59; padding: 32px 0; text-align: center; }
    .error { color: #b53333; padding: 16px; background: #2a1a1a; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>{label}</h1>
  <div id="root"><p class="empty">正在加载…</p></div>

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
            document.getElementById('root').innerHTML = '<p class="empty">暂无数据</p>'
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
            '<div class="error">加载失败：' + err.message + '</div>'
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
- [ ] No UISchema, PluginTable, or PluginForm references — those are removed
