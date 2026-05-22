# 4. HelmPlugin 类参考

```python
from app.plugins.base import (
    HelmPlugin, PermissionDef, SidebarItem, PluginContext,
)
```

## 类属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `str` | ✅ | 插件唯一 ID，URL-slug 风格（小写、连字符）。**安装后不可更改** |
| `version` | `str` | ✅ | 语义版本号，如 `"1.2.0"` |
| `author` | `str` | 推荐 | 作者名称或邮件 |
| `description` | `str` | 推荐 | 一行描述，显示在管理 UI |
| `helm_sdk_version` | `str` | ✅ | PEP 440 说明符，如 `">=1.0,<2.0"` |

## 扩展接口

| 接口 | 说明 |
|------|------|
| `CharacterExtensionProvider` | 在角色总览页注入 Widget 卡片。见 [17. 角色模块扩展 § Widget](17-character-extension.md) |

```python
from app.plugins.base import (
    HelmPlugin, PermissionDef, SidebarItem, PluginContext,
    CharacterExtensionProvider, CharacterExtension,
    CharacterSubmodule,
)
```

## 可覆盖方法

| 方法 | 返回类型 | 说明 |
|------|---------|------|
| `get_router()` | `APIRouter \| None` | 注册到 `/api/v1/plugins/{name}/` 前缀下 |
| `get_permissions()` | `list[PermissionDef]` | 安装时 upsert 到 permissions 表 |
| `get_esi_scopes()` | `list[str]` | ESI OAuth 作用域声明 |
| `get_tasks()` | `list[str]` | Celery 任务模块路径列表 |
| `get_beat_schedule()` | `dict` | 周期性（Beat）定时任务，热加载；结构同 Celery `beat_schedule`。见 [8. 注册 Celery 任务 § 定时任务](08-celery-tasks.md) |
| `get_sidebar_items()` | `list[SidebarItem]` | 注入前端全局侧边栏 |
| `get_character_submodules()` | `list[CharacterSubmodule]` | 注入角色模块子页面（路由 + 侧边栏）。见 [17. 角色模块扩展 § 子模块](17-character-extension.md) |
| `get_static_dir()` | `Path \| None` | 返回前端编译产物目录（含 `index.html`） |
| `get_frontend_dev_url()` | `str \| None` | 开发模式下的 dev server URL（如 `"http://localhost:5174"`） |
