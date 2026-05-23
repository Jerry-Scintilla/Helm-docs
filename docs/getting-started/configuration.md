# 配置参考

Helm 通过 `.env` 文件（或系统环境变量）进行配置。本页列出所有可用的配置项。

## 数据库

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `DATABASE_URL` | — | PostgreSQL 连接字符串，格式：`postgresql+asyncpg://user:pass@host:port/dbname` |
| `DB_POOL_SIZE` | `10` | 连接池大小 |
| `DB_MAX_OVERFLOW` | `20` | 连接池溢出上限 |
| `DB_ECHO` | `false` | 是否打印 SQL 语句（调试用） |

**示例：**
```env
DATABASE_URL=postgresql+asyncpg://helm:mypassword@localhost:5432/helm
```

## Redis

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `REDIS_URL` | `redis://localhost:6379/0` | Redis 连接字符串（Celery Broker） |
| `REDIS_CACHE_URL` | 同 `REDIS_URL` | 缓存专用 Redis（可与 Broker 分离） |

## 安全

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `SECRET_KEY` | — | JWT 签名密钥，**必须设置**，生产环境使用随机长字符串 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT 访问令牌有效期（分钟） |
| `API_TOKEN_EXPIRE_DAYS` | `365` | API Token 有效期（天），`0` 表示永不过期 |

!!! warning "安全提示"
    `SECRET_KEY` 泄露将导致所有 JWT 令牌被伪造，生产环境请使用至少 64 字节的随机字符串：
    ```bash
    python -c "import secrets; print(secrets.token_hex(64))"
    ```

## EVE Online SSO

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `EVE_CLIENT_ID` | — | 在 [CCP 开发者门户](https://developers.eveonline.com/) 申请的 Client ID |
| `EVE_CLIENT_SECRET` | — | 对应的 Client Secret |
| `EVE_CALLBACK_URL` | — | OAuth 回调地址，必须与开发者门户中填写的完全一致 |

**申请 SSO 应用：**

1. 访问 [https://developers.eveonline.com/](https://developers.eveonline.com/)
2. 创建新应用，Connection Type 选 **Authentication & API Access**
3. Callback URL 填写 `https://your-domain/api/v1/auth/callback`
4. 所需 ESI Scopes 根据实际功能选择（插件可额外申请）

## 应用配置

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `APP_ENV` | `development` | 运行模式：`development` 或 `production` |
| `DEBUG` | `false` | 是否开启调试模式 |
| `LOG_LEVEL` | `INFO` | 日志级别：`DEBUG / INFO / WARNING / ERROR` |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | 允许的跨域来源（JSON 数组字符串） |
| `API_PREFIX` | `/api/v1` | API 路径前缀 |

## 管理员配置

Helm 不预置任何管理员账号，也不存在"第一个登录用户自动成为管理员"的机制。首次启动时系统会生成一条一次性授权链接，详见 [超级管理员初始化](../admin-guide/superuser-setup.md)。

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `APP_URL` | — | 应用对外访问地址，用于生成超级管理员授权链接，例如 `https://your-domain.com` |

## Celery / 任务队列

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `CELERY_BROKER_URL` | 同 `REDIS_URL` | Celery Broker 地址 |
| `CELERY_RESULT_BACKEND` | 同 `REDIS_URL` | Celery 结果后端 |
| `CELERY_WORKER_CONCURRENCY` | `4` | Worker 并发数 |

## ESI 配置

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `ESI_BASE_URL` | `https://esi.evetech.net` | ESI API 基础地址 |
| `ESI_DATASOURCE` | `tranquility` | 数据源（`tranquility` 为正式服，`singularity` 为测试服） |
| `ESI_USER_AGENT` | `Helm/1.0` | ESI 请求的 User-Agent（建议包含联系邮箱） |
| `ESI_REFRESH_BUCKET_SIZE` | `50` | 每个刷新批次的角色数量 |

## 市场物价服务

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `MARKET_DEFAULT_REGION_ID` | `10000002` | 出厂默认查询星域（The Forge / Jita）。管理员在后台修改后以 Redis 值为准，此项仅作初始值。 |
| `MARKET_PRICE_TTL` | `3600` | 物价缓存有效期（秒）。增大减少 ESI 请求；减小提高数据新鲜度。 |

## 插件系统

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `PLUGIN_UPLOAD_DIR` | `./plugin_uploads` | 上传 `.whl` 文件的临时目录 |
| `PLUGIN_AUTO_ENABLE` | `false` | 安装后是否自动启用插件 |

## 完整 `.env.example`

```env
# ── 数据库 ──────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://helm:password@localhost:5432/helm
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_ECHO=false

# ── Redis ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0

# ── 安全 ────────────────────────────────────────────────
SECRET_KEY=CHANGE_ME_USE_A_RANDOM_64_BYTE_HEX_STRING
ACCESS_TOKEN_EXPIRE_MINUTES=60
API_TOKEN_EXPIRE_DAYS=365

# ── EVE Online SSO ──────────────────────────────────────
EVE_CLIENT_ID=your_client_id_from_ccp_dev_portal
EVE_CLIENT_SECRET=your_client_secret
EVE_CALLBACK_URL=https://your-domain.com/api/v1/auth/callback

# ── 应用 ────────────────────────────────────────────────
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO
CORS_ORIGINS=["https://your-domain.com"]

# ── 管理员 ──────────────────────────────────────────────
# FIRST_SUPERUSER_CHAR_ID=123456789

# ── Celery ──────────────────────────────────────────────
CELERY_WORKER_CONCURRENCY=4

# ── ESI ─────────────────────────────────────────────────
ESI_DATASOURCE=tranquility
ESI_USER_AGENT=Helm/1.0 (contact: your@email.com)
ESI_REFRESH_BUCKET_SIZE=50
```
