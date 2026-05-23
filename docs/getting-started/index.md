# 部署概览

本章介绍如何将 Helm 部署到你的服务器或本地环境。根据你的场景选择合适的方式：

<div class="feature-grid" markdown="1">

<div class="feature-card" markdown="1">
<div class="icon">🐳</div>

**Docker 部署（推荐）**

无需手动安装 Python / Node.js / PostgreSQL / Redis，一条命令启动全部服务。

适合：生产服务器、VPS、NAS、无开发经验的管理员

[开始 Docker 部署 →](docker.md){ .md-button .md-button--primary }

</div>

<div class="feature-card" markdown="1">
<div class="icon">🛠️</div>

**本地部署**

手动管理每个服务，完全掌控运行环境。

适合：本地开发调试、需要深度定制的场景

[开始本地部署 →](local.md){ .md-button }

</div>

</div>

## 两种方式对比

| | Docker 部署 | 本地部署 |
|---|---|---|
| **前置依赖** | Docker + Docker Compose | Python 3.12、Node.js 18、PostgreSQL、Redis |
| **启动命令** | `docker compose up -d` | 4 个终端分别启动各服务 |
| **数据库迁移** | 容器启动时自动执行 | 手动执行 `alembic upgrade head` |
| **更新升级** | `docker compose pull && up -d` | `git pull` + 重启各服务 |
| **适合环境** | 生产 / 快速体验 | 开发 / 深度定制 |

## 共同前置步骤

无论选择哪种方式，都需要先完成以下准备：

### 1. 注册 EVE SSO 应用

前往 [developers.eveonline.com](https://developers.eveonline.com)，创建一个新的应用：

- **Connection Type**：Authentication & API Access
- **Callback URL**：`http://你的域名/auth/eve/callback`（本地开发填 `http://localhost:8000/auth/eve/callback`）
- **ESI Scopes**：根据需要选择（插件会在安装时自动申请额外 Scope）

记录下 **Client ID** 和 **Client Secret**，后续配置时需要用到。

### 2. 准备配置文件

所有配置通过 `.env` 文件传入，关键项说明见 [配置参考](configuration.md)。

---

!!! tip "不知道选哪个？"
    首次部署或用于生产环境，选 **[Docker 部署](docker.md)**。本地开发或需要调试源码，选 **[本地部署](local.md)**。
