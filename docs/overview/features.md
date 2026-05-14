# 功能特性

## 认证与身份

| 功能 | 说明 |
|------|------|
| EVE SSO 登录 | OAuth 2.0，由 CCP 官方认证，无第三方密码存储 |
| 多角色绑定 | 一个账户可绑定多个 EVE 角色 |
| JWT 会话令牌 | 短期令牌，自动刷新 |
| API Token | 长效 Bearer Token，供程序化访问 |
| RBAC 权限 | 四维度：全局 / 角色级 / 军团级 / 联盟级 |
| 权限节点 | 插件可自定义权限节点，安装时自动注册到数据库 |

## 数据管理

### 角色数据
| 数据类型 | ESI 同步 | 说明 |
|----------|----------|------|
| 基本信息 | ✅ | 姓名、种族、所在军团/联盟 |
| 技能 | ✅ | 已学技能、技能点数、技能队列 |
| 资产 | ✅ | 全角色资产列表（含定位） |
| 钱包 | ✅ | ISK 余额、钱包流水 |
| 邮件 | ✅ | 收件箱、发件箱 |
| 通知 | ✅ | 系统通知 |
| 联系人 | ✅ | 好友/黑名单列表 |
| 军团加入时间 | ✅ | 角色加入当前军团的时间戳 |
| 联盟加入时间 | ✅ | 军团加入当前联盟的时间戳 |

### 军团数据
| 数据类型 | ESI 同步 |
|----------|----------|
| 成员列表 | ✅ |
| 军团资产 | ✅ |
| 财务记录 | ✅ |
| 军团邮件 | ✅ |

### 联盟数据
| 数据类型 | ESI 同步 |
|----------|----------|
| 成员军团列表 | ✅ |
| 联盟概览 | ✅ |

## 插件系统

| 能力 | 说明 |
|------|------|
| 热加载路由 | 插件 FastAPI 路由在启用后立即可用，无需重启 API |
| Celery 任务注册 | 插件可注册后台任务（Worker 软重启生效） |
| 权限声明 | 插件声明的权限在安装时自动写入数据库 |
| ESI 作用域声明 | 插件可请求额外的 ESI OAuth 作用域 |
| 侧边栏注入 | 插件可在主界面侧边栏添加菜单项 |
| iframe 前端 | 插件可提供任意技术栈的前端页面（Vue / React / 原生 HTML） |
| 静态文件服务 | Helm 自动为插件的 `frontend/dist/` 提供文件服务 |
| ExtensionRegistry | 插件间通过命名扩展点注册 / 查询服务 |
| 角色页面扩展 | 插件可在角色详情页注入数据卡片（Widget）和子模块页面 |
| 生命周期钩子 | `on_install` / `on_enable` / `on_disable` / `on_uninstall` |
| 数据事件钩子 | `on_character_updated` / `on_corporation_updated` 等 |
| 独立数据库迁移 | 插件可携带自己的 Alembic 迁移分支 |

### 安装方式
| 方式 | 命令 |
|------|------|
| 从 PyPI 安装 | `POST /api/v1/admin/plugins/install` + `{"package_name": "helm-plugin-xxx"}` |
| 上传 .whl 包 | `POST /api/v1/admin/plugins/install/upload` |

## 后台任务

| 功能 | 说明 |
|------|------|
| Celery Worker | 基于 Redis 的分布式任务队列 |
| 定时 ESI 刷新 | 按桶（Bucket）分批刷新，避免速率限制 |
| 任务运行历史 | 记录任务执行时间、状态、结果 |
| 插件任务注册 | 插件提供模块路径，Worker 重启后自动发现 |

## 管理后台

| 功能 | 路由 |
|------|------|
| 插件列表与状态 | `/admin/plugins` |
| 插件安装 | 从 PyPI 包名或上传 `.whl` |
| 插件启用 / 禁用 | 一键切换，无需重启 |
| 插件卸载 | 可选是否同时 pip uninstall |
| 任务历史 | 查看后台任务执行日志 |
| 用户权限管理 | 为用户 / 角色分配权限节点 |

## 前端

| 功能 | 技术 |
|------|------|
| 主框架 | Vue 3.5 + TypeScript + Vite |
| UI 组件库 | Naive UI 2.44 |
| 状态管理 | Pinia 3.0 |
| 路由 | Vue Router 5.0 |
| HTTP | axios 1.15 |
| Markdown 渲染 | marked 18 + DOMPurify（邮件内容） |
| 插件前端宿主 | iframe + HelmSDK postMessage 协议 |

## 技术栈一览

```
后端
├── Python 3.12+
├── FastAPI 0.136+       (异步 Web 框架)
├── SQLAlchemy 2.0       (异步 ORM)
├── asyncpg              (PostgreSQL 异步驱动)
├── Alembic 1.18+        (数据库迁移)
├── Celery 5.6+ / Redis  (任务队列)
├── Authlib              (OAuth 2.0 / EVE SSO)
├── python-jose          (JWT)
└── httpx                (ESI 异步 HTTP 客户端)

前端
├── Vue 3.5 + TypeScript
├── Vite 8.0
├── Naive UI 2.44
├── Pinia 3.0
└── Vue Router 5.0
```
