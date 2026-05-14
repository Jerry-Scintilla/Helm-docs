# Helm Plugin API 快速参考

完整文档见 `C:\Users\jerry\PycharmProjects\Helm\Markdown\Plugin_Dev_Guide\`

---

## HelmPlugin 完整方法签名

```python
# 来源: backend/app/plugins/base.py

class HelmPlugin(ABC):
    # ── 必须设置的类属性 ──────────────────────────────────────
    name: str = ""                    # 插件唯一 ID，URL-slug，安装后不可改
    version: str = "0.1.0"
    author: str = ""
    description: str = ""
    helm_sdk_version: str = ">=1.0,<2.0"   # 务必保留，否则安装校验失败

    # ── 后端扩展（返回 None/[] 表示不使用该能力）────────────────
    def get_router(self) -> "APIRouter | None": ...
    def get_models(self) -> list: ...           # 声明式，实际迁移用 migrations/
    def get_permissions(self) -> list[PermissionDef]: ...
    def get_esi_scopes(self) -> list[str]: ...
    def get_tasks(self) -> list[str]: ...       # 模块路径字符串列表
    def get_sidebar_items(self) -> list[SidebarItem]: ...

    # ── iframe 前端 ──────────────────────────────────────────
    def get_static_dir(self) -> Path | None: ...
    # 返回编译好的前端目录（含 index.html），随 wheel 分发
    # 示例: return Path(__file__).parent / "frontend" / "dist"

    def get_frontend_dev_url(self) -> str | None: ...
    # 仅在 app_env=development 时生效，指向插件的本地 dev server
    # 示例: return "http://localhost:5174"
    # 发布前务必改回 None

    # ── 数据事件钩子 ─────────────────────────────────────────
    def on_character_updated(self, character_id: int, ctx: PluginContext) -> None: ...
    def on_corporation_updated(self, corporation_id: int, ctx: PluginContext) -> None: ...
    def on_killmail_received(self, killmail: dict, ctx: PluginContext) -> None: ...
    def on_notification_received(self, notification: dict, ctx: PluginContext) -> None: ...

    # ── 生命周期钩子 ────────────────────────────────────────────
    def on_install(self, ctx: PluginContext) -> None: ...    # 首次安装后
    def on_enable(self, ctx: PluginContext) -> None: ...     # 每次启用（含安装）
    def on_disable(self, ctx: PluginContext) -> None: ...    # 每次禁用（含卸载前）
    def on_uninstall(self, ctx: PluginContext) -> None: ...  # 卸载时
```

---

## HelmSDK（前端 JavaScript）

插件 iframe 内的 HTML 引入：
```html
<script src="/plugin-sdk/helm-sdk.js"></script>
```

```javascript
// 初始化（必须首先调用）
HelmSDK.init(function (ctx) {
    // ctx.token    ← JWT Bearer token
    // ctx.apiBase  ← "http://localhost:8000"
})

// 获取当前 token（在 init 回调后可用）
HelmSDK.getToken()         // → string | null
HelmSDK.getApiBase()       // → string | null

// 导航到 Helm 主应用的路由
HelmSDK.navigate('dashboard')   // Vue Router route name

// 请求刷新 token（API 返回 401 后使用）
HelmSDK.requestTokenRefresh()
// 刷新后 SDK 内部自动更新 _token，再调用 getToken() 即可
```

---

## postMessage 协议

| 方向 | type | payload |
|------|------|---------|
| iframe → parent | `helm:ready` | — |
| parent → iframe | `helm:init` | `{ token, apiBase }` |
| iframe → parent | `helm:navigate` | `{ route: string }` |
| iframe → parent | `helm:token:expired` | — |
| parent → iframe | `helm:token:refreshed` | `{ token }` |

---

## 数据类

```python
@dataclass
class PermissionDef:
    name: str          # 格式: "{plugin-name}.{action}"，如 "market-scanner.read"
    scope_type: str    # "global" | "character" | "corporation" | "alliance"
    description: str = ""

@dataclass
class SidebarItem:
    label: str
    route: str     # 前端路由路径，如 "/plugins/market-scanner"
    icon: str = "" # emoji 或图标标识符
    order: int = 100  # 数字越小越靠前

@dataclass
class PluginContext:
    db_session_factory: Any  # = AsyncSessionLocal，async with 使用
    esi_client: Any          # 保留，Phase 4
```

---

## ExtensionRegistry API

```python
# 来源: backend/app/plugins/registry.py
from app.plugins.registry import extension_registry

# 注册（在 on_enable 中调用）
extension_registry.register(
    point="mcp.resource_provider",  # 扩展点名称
    impl=self,                       # 实现对象（通常是 plugin 实例）
    plugin_name=self.name,           # 用于自动清理
)

# 查询（在消费插件的路由/任务中调用）
providers = extension_registry.get_all("mcp.resource_provider")

# 调试
extension_registry.list_points()
# → {"mcp.resource_provider": ["market-scanner", "zkill-tracker"]}
```

框架在 disable/uninstall 时自动调用 `unregister_plugin(name)` —— `on_disable` 无需手动清理。

---

## 权限依赖

```python
from app.core.permissions import require_permission, get_current_user
from fastapi import Depends

@router.get("/secret")
async def secret_data(_=Depends(require_permission("market-scanner.read"))):
    ...

@router.get("/public")
async def public_data(user=Depends(get_current_user)):
    ...
```

---

## Celery 任务约束

```python
# ✅ 正确：使用 Helm 的 celery_app 实例
from app.tasks.celery_app import celery_app

@celery_app.task(name="market_scanner.scan_region")
def scan_region(region_id: int):
    ...

# ❌ 错误：不要新建 Celery 实例
from celery import Celery
app = Celery(...)
```

---

## 数据库访问模式

```python
# 在路由处理函数中（异步上下文）
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/data")
async def get_data(db: AsyncSession = Depends(get_db)):
    from {pkg_name}.models import MyRecord
    result = await db.execute(select(MyRecord))
    return result.scalars().all()

# 在 on_install / on_enable 等同步钩子中访问数据库
def on_install(self, ctx: PluginContext) -> None:
    import asyncio
    async def _init():
        async with ctx.db_session_factory() as db:
            db.add(MyRecord(key="init"))
            await db.commit()
    asyncio.get_event_loop().run_until_complete(_init())
```

---

## 已生效的 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/admin/plugins/install` | 从 PyPI 安装 |
| POST | `/api/v1/admin/plugins/{name}/enable` | 启用 |
| POST | `/api/v1/admin/plugins/{name}/disable` | 禁用 |
| DELETE | `/api/v1/admin/plugins/{name}` | 卸载（?pip_remove=false） |
| GET | `/api/v1/admin/plugins/{name}/status` | 状态检查 |
| GET | `/api/v1/plugins/` | 公开：已启用插件清单（含 frontend_url） |
| * | `/api/v1/plugins/{name}/*` | 插件自己注册的端点 |
| GET | `/plugin-ui/{name}/{file}` | 插件静态文件服务（SPA fallback 到 index.html） |
| GET | `/plugin-sdk/helm-sdk.js` | Helm SDK，供插件 iframe 内引用 |

---

## 常见错误及原因

| 错误 | 原因 |
|------|------|
| `No helm.plugins entry point found` | `pyproject.toml` 的 `[project.entry-points."helm.plugins"]` 拼写错误，或 `pip install -e` 未执行 |
| `Plugin requires helm_sdk_version ...` | `helm_sdk_version` 未设置或版本不兼容，改为 `">=1.0,<2.0"` |
| `is not a subclass of HelmPlugin` | 入口点字符串中类名拼写错误，或 entry point 格式用了 `.` 而非 `:` 分隔模块和类 |
| Celery 任务无法执行 | Worker 未重启，或任务未使用 Helm 的 `celery_app` 实例 |
| 路由 404 但插件已 enabled | `get_router()` 返回了 `None`，或 `status.router_mounted` 为 false |
| `/plugin-ui/{name}/index.html` 返回 404 | `get_static_dir()` 未实现或路径下不存在 `index.html`（dev 模式下还需检查是否有 dev_url） |
| iframe 内 API 调用失败 | `HelmSDK.init()` 未调用或 token 尚未接收，确保 API 调用在 `init` 回调内执行 |
