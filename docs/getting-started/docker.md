# Docker 部署

Docker Compose 是生产环境的推荐部署方式。一条命令即可启动全部服务：PostgreSQL、Redis、后端 API、Celery Worker、Celery Beat 和 Nginx。

## 前置要求

| 依赖 | 最低版本 |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2（使用 `docker compose` 子命令） |

不需要安装 Python、Node.js、PostgreSQL 或 Redis，这些都由容器提供。

---

## 方式一：使用预构建镜像（推荐）

官方镜像已发布到 GitHub Container Registry，**无需下载源码**即可直接部署。

### 第一步：下载部署文件

```bash
curl -O https://raw.githubusercontent.com/Jerry-Scintilla/Helm/master/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/Jerry-Scintilla/Helm/master/.env.example
cp .env.example .env
```

### 第二步：配置环境变量

编辑 `.env`，填写以下必填项：

```env
# ── 数据库密码 ────────────────────────────────────────────
POSTGRES_PASSWORD=your_strong_db_password

# ── 应用密钥（生产环境务必替换为随机字符串）──────────────
APP_SECRET_KEY=your_very_long_random_secret_key
JWT_SECRET_KEY=another_very_long_random_jwt_secret

# ── 数据库连接（与上方 POSTGRES_PASSWORD 保持一致）────────
DB_URL=postgresql+asyncpg://helm:your_strong_db_password@postgres:5432/helm

# ── 应用访问地址（用于生成管理员初始化链接）──────────────
APP_URL=http://your-domain

# ── EVE SSO（在 developers.eveonline.com 申请）───────────
EVE_CLIENT_ID=your_eve_client_id
EVE_CLIENT_SECRET=your_eve_client_secret
EVE_CALLBACK_URL=http://your-domain/auth/eve/callback
```

!!! tip "生成随机密钥"
    ```bash
    python3 -c "import secrets; print(secrets.token_hex(32))"
    ```

完整配置项说明见 [配置参考](configuration.md)。

### 第三步：启动

```bash
docker compose -f docker-compose.prod.yml up -d
```

Docker 会自动拉取官方镜像并启动全部服务。

### 第四步：初始化超级管理员

首次启动时，后端日志会打印一条**一次性授权链接**：

```bash
docker compose -f docker-compose.prod.yml logs backend | grep "HELM SETUP" -A 8
```

输出示例：

```
======================================================================
HELM SETUP: No superuser found.
Log in via EVE SSO, then open the following URL in your browser:

  http://your-domain/setup/superuser/nH7sZqQh...

This link is single-use and expires in 24 hours.
To regenerate: docker exec helm-backend-1 /app/.venv/bin/python -m cli admin setup-link
======================================================================
```

1. 打开浏览器访问 `http://your-domain`，完成 EVE SSO 登录
2. 在同一浏览器中打开日志里的链接
3. 页面自动完成授权并跳转到 Dashboard

详细说明见 [超级管理员初始化](../admin-guide/superuser-setup.md)。

### 升级到新版本

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 方式二：从源码构建

适合需要修改源码或在本地测试自定义改动的场景。

### 第一步：克隆仓库

```bash
git clone https://github.com/Jerry-Scintilla/Helm.git
cd Helm
```

### 第二步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填写必填项（同方式一）。

### 第三步：构建并启动

```bash
docker compose up -d
```

首次构建会较慢（需要编译前端和安装后端依赖）。

### 更新代码后重建

```bash
git pull
docker compose build
docker compose up -d
```

---

## 验证部署

```bash
# 检查所有容器状态
docker compose ps

# 检查 API 健康
curl http://your-domain/health
# → {"status":"ok","app":"Helm"}

# 查看后端日志
docker compose logs backend --tail 50
```

## 常用管理命令

```bash
# 停止服务（保留数据）
docker compose down

# 查看实时日志
docker compose logs -f backend celery-worker

# 重启单个服务
docker compose restart backend

# 重新生成管理员授权链接
docker exec helm-backend-1 /app/.venv/bin/python -m cli admin setup-link

# 停止并删除所有数据（危险操作）
docker compose down -v
```

## 容器说明

| 容器 | 作用 |
|------|------|
| `postgres` | PostgreSQL 主数据库 |
| `redis` | Celery Broker、缓存、Token 存储 |
| `backend` | FastAPI 后端 API（含自动数据库迁移） |
| `celery-worker` | 异步任务 Worker（ESI 数据同步等） |
| `celery-beat` | 定时任务调度器 |
| `nginx` | 反向代理 + 前端静态文件服务 |

---

!!! tip "下一步"
    - 进入 [管理后台](../admin-guide/index.md) 配置用户权限
    - 在 [插件市场](../admin-guide/plugin-marketplace.md) 安装第一个插件
    - 查看 [配置参考](configuration.md) 了解全部环境变量
