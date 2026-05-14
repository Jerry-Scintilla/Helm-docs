# Helm 插件开发指南

> **SDK 版本**：`1.0.0` · **兼容声明**：`>=1.0,<2.0`  
> **适用服务端**：Helm Phase 3+

---

## 目录

| 章节 | 文件 |
|------|------|
| [1. 概念速览](01-concepts.md) | `01-concepts.md` |
| [2. 最小可工作插件](02-minimal-plugin.md) | `02-minimal-plugin.md` |
| [3. 包结构与 Entry Point](03-package-structure.md) | `03-package-structure.md` |
| [4. HelmPlugin 类参考](04-helmplugin-reference.md) | `04-helmplugin-reference.md` |
| [5. 生命周期钩子](05-lifecycle-hooks.md) | `05-lifecycle-hooks.md` |
| [6. 注册 API 路由](06-api-router.md) | `06-api-router.md` |
| [7. 注册权限](07-permissions.md) | `07-permissions.md` |
| [8. 注册 Celery 任务](08-celery-tasks.md) | `08-celery-tasks.md` |
| [9. ESI 作用域声明](09-esi-scopes.md) | `09-esi-scopes.md` |
| [10. 侧边栏菜单](10-sidebar.md) | `10-sidebar.md` |
| [11. iframe 前端](11-iframe-frontend.md) | `11-iframe-frontend.md` |
| [12. 插件自有数据库迁移](12-database-migrations.md) | `12-database-migrations.md` |
| [13. 插件间通信](13-extension-registry.md) | `13-extension-registry.md` |
| [14. 本地测试流程](14-local-testing.md) | `14-local-testing.md` |
| [15. 发布到 PyPI](15-publish-pypi.md) | `15-publish-pypi.md` |
| [16. API 端点参考](16-api-endpoints.md) | `16-api-endpoints.md` |
| [17. 角色模块扩展](17-character-extension.md) | `17-character-extension.md` |

---

## 附录：SDK 版本兼容矩阵

| Helm SDK | 特性 |
|---------|------|
| `1.0.0` | 路由、任务、权限、ExtensionRegistry、iframe 前端（HelmSDK postMessage）、角色 Widget 扩展（CharacterExtensionProvider）、角色子模块（CharacterSubmodule） |
