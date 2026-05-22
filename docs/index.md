---
hide:
  - navigation
  - toc
---

<div class="helm-hero" markdown>

# ⚓ Helm

<p class="lead">EVE Online 开源舰队管理平台</p>
<p class="tagline">插件化架构 · RBAC 权限 · ESI 实时同步 · 热加载扩展</p>

<div class="btn-row" markdown>
[快速开始](getting-started/index.md){ .md-button .md-button--primary }
[插件开发](plugin-dev/index.md){ .md-button }
[GitHub](https://github.com/YOUR_GITHUB_USERNAME/helm){ .md-button }
</div>

</div>

## 核心功能

<div class="feature-grid" markdown>

<div class="feature-card" markdown>
<span class="icon">🔐</span>
### EVE SSO 认证
通过 CCP 官方 OAuth 2.0 单点登录，支持多角色绑定与 API Token 程序化访问，无需独立账户体系。
</div>

<div class="feature-card" markdown>
<span class="icon">📡</span>
### ESI 实时数据同步
通过 EVE Swagger Interface 自动拉取角色技能、资产、钱包、邮件、通知等数据，支持桶式速率限制。
</div>

<div class="feature-card" markdown>
<span class="icon">🛡️</span>
### 精细 RBAC 权限
全局、角色级、军团级、联盟级四维度权限体系，插件可自定义权限节点并在安装时自动注册。
</div>

<div class="feature-card" markdown>
<span class="icon">🔌</span>
### 热加载插件系统
基于 Python wheel 的插件架构，安装/启用/禁用无需重启 API 服务。插件可注册路由、任务、权限、前端页面。
</div>

<div class="feature-card" markdown>
<span class="icon">⚙️</span>
### 异步任务队列
Celery + Redis 驱动的后台任务系统，支持定时 ESI 数据同步、自定义插件任务和任务运行历史追踪。
</div>

<div class="feature-card" markdown>
<span class="icon">🏗️</span>
### 现代技术栈
FastAPI 后端 + Vue 3 / Naive UI 前端，PostgreSQL 持久化，Alembic 数据库迁移，asyncio 全程异步。
</div>

</div>

## 快速导航

| 我是… | 从这里开始 |
|-------|------------|
| **首次部署的管理员** | [安装部署](getting-started/index.md) → [配置参考](getting-started/configuration.md) |
| **日常使用的舰队成员** | [用户指南](user-guide/index.md) → [EVE SSO 登录](user-guide/authentication.md) |
| **管理插件的站长** | [管理员指南](admin-guide/index.md) → [插件管理](admin-guide/plugins.md) |
| **开发自定义插件的开发者** | [插件开发指南](plugin-dev/index.md) → [下载 AI 脚手架 Skill](downloads.md) |
| **集成 API 的工具开发者** | [API 参考](api-reference/index.md) |

---

!!! note "关于 EVE Online"
    Helm 是 EVE Online 的独立玩家工具，未获得 CCP Games 官方授权或背书。EVE Online 及相关内容为 CCP Games 的商标。

!!! warning "安全漏洞报告"
    如发现安全漏洞，请发送邮件至 [jerrycaocao@126.com](mailto:jerrycaocao@126.com)，勿公开提交 Issue。
