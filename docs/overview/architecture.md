# 系统架构

## 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         浏览器 / 客户端                        │
│                                                             │
│  ┌──────────────────────┐    ┌────────────────────────────┐ │
│  │    Vue 3 SPA 主界面   │    │   插件 iframe 页面          │ │
│  │  (Naive UI / Pinia)  │◄──►│  (任意前端技术栈)            │ │
│  │                      │    │  HelmSDK postMessage        │ │
│  └──────────┬───────────┘    └────────────────────────────┘ │
└─────────────┼───────────────────────────────────────────────┘
              │ HTTP / REST (JWT Bearer)
              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI 后端                             │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ 核心路由     │  │  插件路由     │  │  静态文件服务      │  │
│  │ /auth       │  │ (热挂载)      │  │ /plugin-ui/{name} │  │
│  │ /characters │  │ /api/v1/     │  │ /plugin-sdk/      │  │
│  │ /corps      │  │ plugins/{n}/ │  │  helm-sdk.js       │  │
│  │ /admin      │  └──────────────┘  └───────────────────┘  │
│  └─────────────┘                                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   插件管理器                           │   │
│  │  PluginManager · ExtensionRegistry · PluginInstaller  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬────────────────────────────────────┬─────────────┘
           │ SQLAlchemy (asyncpg)               │ Celery
           ▼                                   ▼
┌─────────────────────┐           ┌────────────────────────┐
│     PostgreSQL      │           │   Celery Worker        │
│                     │           │                        │
│  · 用户 / 角色       │           │  · ESI 数据拉取任务      │
│  · 军团 / 联盟       │           │  · 自定义插件任务        │
│  · 权限 / 插件       │           │  · 任务运行历史记录      │
│  · ESI 缓存数据      │           │                        │
│  · 插件自有表        │           │  ┌──────────────────┐  │
└─────────────────────┘           │  │  Redis (Broker)   │  │
                                  │  └──────────────────┘  │
                                  └───────────┬────────────┘
                                              │ httpx
                                              ▼
                                  ┌────────────────────────┐
                                  │  EVE ESI API (CCP)     │
                                  │  esi.evetech.net        │
                                  └────────────────────────┘
```

## 组件说明

### FastAPI 后端 (`backend/`)

后端为全异步架构，基于 FastAPI 0.136+ 和 SQLAlchemy 2.0 asyncio 模式。

| 模块 | 路径 | 职责 |
|------|------|------|
| 核心配置 | `app/core/` | 数据库连接、认证、配置加载 |
| ORM 模型 | `app/models/` | 所有数据库表定义 |
| 路由 | `app/routers/` | REST API 端点 |
| 权限 | `app/core/permissions.py` | RBAC 依赖注入 |
| 插件管理器 | `app/plugins/manager.py` | 插件加载、热挂载、生命周期 |
| 插件安装器 | `app/plugins/installer.py` | pip 安装 / whl 上传 |
| 扩展注册表 | `app/plugins/registry.py` | 插件间通信 |
| ESI 层 | `app/esi/` | ESI 客户端、缓存、速率限制 |
| 后台任务 | `app/tasks/` | Celery 任务定义 |

### Vue 3 前端 (`frontend/`)

单页应用（SPA），通过 axios 调用 Helm REST API，使用 Pinia 管理状态。

| 模块 | 路径 | 职责 |
|------|------|------|
| 视图 | `src/views/` | 各页面组件（Dashboard、角色、军团、管理） |
| 路由 | `src/router/` | Vue Router 配置 |
| 状态 | `src/stores/` | Pinia Store（认证、角色、UI） |
| API 客户端 | `src/api/` | axios 封装，与后端通信 |
| 组件 | `src/components/` | 可复用 UI 组件 |

### 插件系统

```
Python wheel 包 (helm-plugin-xxx)
│
├── pyproject.toml          → entry_points["helm.plugins"]
├── {pkg}/plugin.py         → 继承 HelmPlugin 的插件类
├── {pkg}/routers.py        → FastAPI APIRouter（可选）
├── {pkg}/tasks.py          → Celery 任务（可选）
├── {pkg}/models.py         → SQLAlchemy 模型（可选）
├── {pkg}/frontend/dist/    → 编译后的前端（可选）
└── migrations/             → Alembic 迁移脚本（可选）
```

插件启用后，`PluginManager` 将其 `APIRouter` 动态挂载到 FastAPI 应用的 `/api/v1/plugins/{name}/` 路径下，**无需重启服务**。

### 插件前端（HelmSDK）

```
Helm 主界面
│
└── <iframe src="/plugin-ui/{name}/index.html"
          sandbox="allow-scripts allow-same-origin allow-forms">
      │
      └── <script src="/plugin-sdk/helm-sdk.js">
            ↕ postMessage 协议
          HelmSDK.init(ctx => {
            ctx.token   → JWT Bearer Token
            ctx.apiBase → "http://your-helm-instance"
          })
```

### ESI 数据流

```
Celery Worker (定时触发)
    │
    ▼
ESI 桶 (Bucket) — 按 character_id 分组
    │
    ├─→ httpx → esi.evetech.net
    │              │
    │              ▼
    │         逻辑过期缓存层（支持后台刷新）
    │              │
    └─────────────►▼
              PostgreSQL (ESI 数据表)
                   │
                   ▼
              FastAPI 路由 → 前端展示
```

## 数据模型关系

```
User ──1:N──► Character ──N:1──► Corporation ──N:1──► Alliance
                  │
                  ├──► Wallet / Mail / Assets / Skills / Notifications
                  │
                  └──► APIToken (程序化访问令牌)

Plugin
  ├── name, version, author
  ├── status (enabled / disabled)
  └── router_mounted (bool)

Permission
  ├── name ("plugin-name.action")
  ├── scope_type (global / character / corporation / alliance)
  └── plugin_name (所属插件)

Bucket ──1:N──► Character (ESI 刷新批次分组)

TaskRun
  ├── task_name
  ├── started_at / finished_at
  └── status / result
```

## 部署拓扑

```
                    ┌─────────────┐
                    │  Nginx /    │
                    │  Caddy      │  (可选反向代理)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌────────────┐   ┌────────────┐
    │ Uvicorn  │    │  Vite      │   │  Celery    │
    │ FastAPI  │    │  Build     │   │  Worker    │
    │ :8000    │    │  (静态文件) │   │            │
    └──────────┘    └────────────┘   └────────────┘
          │                                │
          └──────────────┬─────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PostgreSQL│   │  Redis   │   │  ESI API │
    │  :5432   │   │  :6379   │   │ (外部)   │
    └──────────┘   └──────────┘   └──────────┘
```
