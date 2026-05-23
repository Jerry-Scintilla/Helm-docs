# 本地部署

本地部署适合**开发调试**或**需要深度定制**的场景，你需要手动安装和管理每个依赖服务。

## 前置要求

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| Python | 3.12+ | 后端运行环境 |
| Node.js | 18+ | 前端构建 |
| PostgreSQL | 14+ | 主数据库 |
| Redis | 7+ | Celery Broker / 缓存 |
| Git | — | 代码拉取 |

## 第一步：克隆仓库

```bash
git clone https://github.com/Jerry-Scintilla/Helm.git
cd Helm
```

## 第二步：创建数据库

```bash
# 以 PostgreSQL 超级用户身份执行
psql -U postgres -c "CREATE USER helm WITH PASSWORD 'yourpassword';"
psql -U postgres -c "CREATE DATABASE helm OWNER helm;"
```

## 第三步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填写以下关键项：

```env
# ── 数据库 ────────────────────────────────────────────────
DB_URL=postgresql+asyncpg://helm:yourpassword@localhost:5432/helm

# ── Redis ─────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# ── 密钥（生产环境务必替换为随机字符串）──────────────────
APP_SECRET_KEY=your_random_secret_key
JWT_SECRET_KEY=your_random_jwt_secret

# ── 应用地址 ──────────────────────────────────────────────
APP_URL=http://localhost:8000

# ── EVE SSO ───────────────────────────────────────────────
EVE_CLIENT_ID=your_eve_client_id
EVE_CLIENT_SECRET=your_eve_client_secret
EVE_CALLBACK_URL=http://localhost:8000/auth/eve/callback
```

完整配置项说明见 [配置参考](configuration.md)。

## 第四步：安装后端依赖

推荐使用 [uv](https://github.com/astral-sh/uv)（更快），也可使用标准 pip：

=== "uv（推荐）"

    ```bash
    cd backend
    uv sync
    source .venv/bin/activate  # Linux / macOS
    # 或 .venv\Scripts\activate  # Windows
    ```

=== "pip"

    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate  # Linux / macOS
    # 或 .venv\Scripts\activate  # Windows
    pip install -e .
    ```

## 第五步：执行数据库迁移

```bash
# 确保虚拟环境已激活，且在 backend/ 目录下
alembic upgrade head
```

## 第六步：安装前端依赖

```bash
cd ../frontend
npm install
```

## 第七步：启动服务

本地部署需要同时运行四个进程，建议使用多个终端窗口或 tmux：

=== "开发模式"

    **终端 1 — 后端 API（热重载）**
    ```bash
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

    **终端 2 — Celery Worker**
    ```bash
    cd backend
    celery -A app.tasks.celery_app worker \
      --queues=default,characters,corporations,bucket,high \
      --loglevel=info
    ```

    **终端 3 — Celery Beat（定时任务）**
    ```bash
    cd backend
    celery -A app.tasks.celery_app beat --loglevel=info
    ```

    **终端 4 — 前端开发服务器**
    ```bash
    cd frontend
    npm run dev
    # → http://localhost:5173
    ```

=== "生产模式"

    **后端**
    ```bash
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
    ```

    **Celery Worker（后台）**
    ```bash
    cd backend
    celery -A app.tasks.celery_app worker \
      --queues=default,characters,corporations,bucket,high \
      --loglevel=info --detach
    ```

    **Celery Beat（后台）**
    ```bash
    celery -A app.tasks.celery_app beat --loglevel=info --detach
    ```

    **前端**：构建后用 Nginx 或 Caddy 托管 `frontend/dist/`：
    ```bash
    cd frontend
    npm run build
    # 构建产物位于 frontend/dist/
    ```

## 第八步：初始化超级管理员

首次启动后，后端日志会打印一条**一次性授权链接**：

```
======================================================================
HELM SETUP: No superuser found.
Log in via EVE SSO, then open the following URL in your browser:

  http://localhost:8000/setup/superuser/xxxx...

This link is single-use and expires in 24 hours.
======================================================================
```

1. 打开浏览器访问 `http://localhost:5173`，完成 EVE SSO 登录
2. 在同一浏览器中打开日志里的授权链接
3. 页面自动完成授权并跳转到 Dashboard

如需重新生成链接：

```bash
cd backend
python -m cli admin setup-link
```

详细说明见 [超级管理员初始化](../admin-guide/superuser-setup.md)。

## 验证部署

```bash
# 检查后端健康状态
curl http://localhost:8000/health
# → {"status":"ok","app":"Helm"}
```

前端开发模式下访问 `http://localhost:5173`，生产模式下访问后端地址 `http://localhost:8000`。

## 常见问题

**数据库连接失败**

确认 PostgreSQL 正在运行，且 `.env` 中 `DB_URL` 的用户名、密码、端口与创建时一致。

**Celery 任务不执行**

确认 Redis 正在运行，且 `CELERY_BROKER_URL` 配置正确。Worker 日志中应有 `Connected to redis://...` 的提示。

**EVE SSO 回调失败**

确认 `EVE_CALLBACK_URL` 与 [developers.eveonline.com](https://developers.eveonline.com) 中填写的回调地址**完全一致**（包括协议、域名和路径）。

---

!!! tip "下一步"
    - 进入 [管理后台](../admin-guide/index.md) 配置用户权限
    - 在 [插件市场](../admin-guide/plugin-marketplace.md) 安装第一个插件
    - 查看 [配置参考](configuration.md) 了解全部环境变量
