# 1. 概念速览

Helm 插件运行在与服务端共享的同一 Python virtualenv 中。安装、启用、禁用、卸载全程无需重启 API 进程，管理员通过 `/admin/plugins` 页面操作。

**插件能做什么：**

| 能力 | 方式 |
|------|------|
| 暴露新 REST 端点 | `get_router()` |
| 添加 Celery 后台任务 | `get_tasks()` |
| 声明权限 | `get_permissions()` |
| 申请 ESI OAuth 作用域 | `get_esi_scopes()` |
| 向侧边栏注入菜单 | `get_sidebar_items()` |
| 提供完整前端页面 | `get_static_dir()` + HelmSDK |
| 响应角色/公司数据更新 | 事件钩子 |
| 向其他插件提供服务 | ExtensionRegistry |
| 运行自有数据库迁移 | `migrations/` 目录 |

**前端策略**：Helm 使用 **iframe + HelmSDK 前端**。插件随 Python 包附带编译好的 HTML/JS/CSS 静态文件，Helm 将其挂载在 `<iframe>` 中。插件通过轻量的 `postMessage` SDK（`/plugin-sdk/helm-sdk.js`）获取 JWT token 并调用 API，与宿主 SPA 完全隔离。插件可以使用任意前端技术栈——原生 HTML、Vue、React 均可，或者无构建工具直接写 HTML。
