# 超级管理员初始化

Helm 不设置默认密码，也不预置任何管理员账号。首次部署时，系统会自动生成一条**一次性授权链接**，访问该链接的已登录用户将获得超级管理员权限。

## 工作原理

```
首次启动
    │
    ├─ 检测是否存在超级管理员？
    │       │
    │       ├─ 是 → 静默启动，不生成链接
    │       │
    │       └─ 否 → 生成随机 Token，写入 Redis（24h TTL）
    │                打印授权 URL 到容器日志
    │
用户操作
    │
    ├─ 1. EVE SSO 登录
    ├─ 2. 浏览器打开授权链接
    └─ 3. 后端验证 Token（消费并删除）
           ├─ 创建 superadmin 角色（若不存在）
           ├─ 授予 global.superuser 权限
           ├─ 签发新的 JWT Token（含 is_superuser=true）
           └─ 前端存储新 Token，立即跳转 Dashboard
```

## 获取初始授权链接

### Docker 部署

启动后查看日志：

```bash
docker compose logs backend | grep "HELM SETUP" -A 8
```

或实时监听：

```bash
docker compose logs -f backend 2>&1 | grep -A 8 "HELM SETUP"
```

日志输出示例：

```
======================================================================
HELM SETUP: No superuser found.
Log in via EVE SSO, then open the following URL in your browser:

  http://your-domain/setup/superuser/nH7sZqQhm5vrCLGlILLUSU8ePbJQeYAK-7Syd7rEYfI

This link is single-use and expires in 24 hours.
To regenerate: docker exec helm-backend-1 /app/.venv/bin/python -m cli admin setup-link
======================================================================
```

### 本地开发

```bash
cd backend
uvicorn app.main:app --reload
# 观察启动日志，HELM SETUP 段落包含授权链接
```

## 使用授权链接

!!! warning "必须先登录"
    授权链接不包含登录功能。请**先完成 EVE SSO 登录**，再访问该链接。

**完整步骤：**

1. 打开浏览器，访问 Helm 首页，点击 **EVE Online 登录** 完成 SSO 认证
2. 在同一浏览器中，粘贴日志中的授权链接并访问
3. 系统自动完成授权 → 签发携带超级管理员权限的新 Token → 跳转 Dashboard

访问成功后，管理后台导航项（`/admin`）会立即出现在侧边栏，**无需重新登录**。

## 重新生成授权链接

链接过期（24 小时）或丢失时，可随时重新生成：

=== "Docker"

    ```bash
    docker exec helm-backend-1 /app/.venv/bin/python -m cli admin setup-link
    ```

=== "本地"

    ```bash
    cd backend
    python -m cli admin setup-link
    ```

输出示例：

```
Superuser setup link generated (single-use, 24h TTL):

  http://your-domain/setup/superuser/abc123...

Log in via EVE SSO first, then open the link in your browser.
```

!!! note "已有超级管理员时"
    重新生成命令在任何情况下均可执行，不受现有超级管理员数量影响。但**只有满足以下条件才有意义**：确实需要为新账号授权，或当前所有超级管理员账号均已失效。

## 权限说明

获得超级管理员权限后，账号具备：

| 权限 | 说明 |
|------|------|
| `global.superuser` | 绕过所有权限检查，访问全部 API 和管理后台 |
| `superadmin` 角色 | RBAC 角色标记，可在用户列表中识别 |
| `is_superuser` 标志 | User 模型字段，用于快速鉴权短路 |

## 安全设计

| 特性 | 实现方式 |
|------|---------|
| 单次使用 | Token 消费后从 Redis 原子删除 |
| 时间限制 | Redis TTL 24 小时，过期自动失效 |
| 高熵 Token | `secrets.token_urlsafe(32)`，256 位随机 |
| 必须已认证 | 端点依赖 `get_current_user`，未登录返回 401 |
| 已有管理员时静默 | 启动时自动检测，有超级管理员则不生成链接 |
| 即时生效 | 授权同时签发新 JWT，无需重新登录 |

## 常见问题

**Q：访问链接时提示"Invalid or expired setup token"**

链接已被使用或超过 24 小时有效期。重新生成一条：

```bash
docker exec helm-backend-1 /app/.venv/bin/python -m cli admin setup-link
```

**Q：访问链接后跳转到了登录页**

正常行为。系统检测到你尚未登录，会先引导你完成 EVE SSO 登录。登录完成后，系统会自动回跳到授权链接并完成授权。

**Q：已经有超级管理员了，但又多了一个账号需要权限**

通过现有超级管理员账号登录，进入 `/admin/users`，手动为该用户分配 `superadmin` 角色，或使用 `helm admin setup-link` 生成一条新链接。

**Q：忘记了当前超级管理员是哪个账号**

```bash
# Docker 环境
docker exec helm-backend-1 /app/.venv/bin/python -c "
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def run():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.is_superuser == True))
        for u in result.scalars():
            print(f'ID={u.id}  username={u.username}')

asyncio.run(run())
"
```
