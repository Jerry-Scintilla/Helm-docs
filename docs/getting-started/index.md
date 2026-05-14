# 安装部署

本章介绍如何从零部署一个完整的 Helm 实例，包括后端、前端、数据库和任务队列。

## 前置要求

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| Python | 3.12+ | 后端运行环境 |
| Node.js | 18+ | 前端构建 |
| PostgreSQL | 14+ | 主数据库 |
| Redis | 6+ | Celery Broker / 缓存 |
| Git | — | 代码拉取 |

## 第一步：获取源码

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/helm.git
cd helm
```

## 第二步：配置环境变量

在项目根目录创建 `.env` 文件（基于示例）：

```bash
cp .env.example .env
```

编辑 `.env`，至少填写以下关键项：

```env
# 数据库
DATABASE_URL=postgresql+asyncpg://helm:yourpassword@localhost:5432/helm

# Redis
REDIS_URL=redis://localhost:6379/0

# 安全密钥（随机字符串，生产环境务必修改）
SECRET_KEY=your-very-long-random-secret-key-here

# EVE SSO（在 CCP 开发者门户申请）
EVE_CLIENT_ID=your_eve_client_id
EVE_CLIENT_SECRET=your_eve_client_secret
EVE_CALLBACK_URL=http://your-domain/api/v1/auth/callback

# 运行模式
APP_ENV=production
```

完整配置项见 [配置参考](configuration.md)。

## 第三步：创建数据库

```bash
# 以 PostgreSQL 超级用户身份执行
psql -U postgres -c "CREATE USER helm WITH PASSWORD 'yourpassword';"
psql -U postgres -c "CREATE DATABASE helm OWNER helm;"
```

## 第四步：安装后端依赖

```bash
cd backend
pip install -e ".[dev]"     # 开发模式
# 或
pip install .               # 生产模式
```

## 第五步：执行数据库迁移

```bash
cd backend
alembic upgrade head
```

## 第六步：构建前端

```bash
cd frontend
npm install
npm run build
```

构建产物位于 `frontend/dist/`。

## 第七步：启动服务

=== "开发模式"

    打开三个终端，分别运行：

    **终端 1 — 后端 API**
    ```bash
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

    **终端 2 — Celery Worker**
    ```bash
    cd backend
    celery -A app.tasks.celery_app worker --loglevel=info
    ```

    **终端 3 — 前端开发服务器**
    ```bash
    cd frontend
    npm run dev
    # → http://localhost:5173
    ```

=== "生产模式（Uvicorn）"

    ```bash
    # 后端
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

    # Celery Worker（后台）
    celery -A app.tasks.celery_app worker --loglevel=info --detach

    # 前端：用 Nginx 或 Caddy 托管 frontend/dist/
    ```

=== "Docker Compose（推荐生产）"

    项目根目录提供 `docker-compose.yml`（若存在）：

    ```bash
    docker compose up -d
    ```

    该命令会同时启动 PostgreSQL、Redis、Uvicorn、Celery Worker 和 Nginx。

## 第八步：创建首个管理员账户

Helm 使用 EVE SSO 登录，第一个登录的用户默认获得管理员权限（可在 `.env` 中通过 `FIRST_SUPERUSER_CHAR_ID` 指定特定角色 ID）。

打开浏览器访问 `http://localhost:5173`，点击 **EVE SSO 登录** 完成认证。

## 验证部署

```bash
# 检查 API 健康状态
curl http://localhost:8000/health

# 检查插件系统
curl http://localhost:8000/api/v1/plugins/ \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

!!! tip "下一步"
    - 查看 [配置参考](configuration.md) 了解所有环境变量
    - 进入 [管理员指南](../admin-guide/index.md) 开始配置用户权限
    - 在 [插件管理](../admin-guide/plugins.md) 中安装第一个插件
