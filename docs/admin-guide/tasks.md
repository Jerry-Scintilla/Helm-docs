# 后台任务

Helm 使用 **Celery + Redis** 运行后台任务，主要用于定时同步 ESI 数据和执行插件自定义任务。

## 任务历史

进入 **管理后台 → 任务历史**（`/admin/tasks`），可以查看所有后台任务的执行记录：

| 列 | 说明 |
|----|------|
| 任务名称 | Celery 任务的完整路径，如 `app.tasks.sync_character` |
| 开始时间 | 任务开始执行的时间戳 |
| 结束时间 | 任务完成时间 |
| 状态 | `success` / `failure` / `running` |
| 结果 | 任务返回值或错误信息摘要 |

## 内置 ESI 同步任务

Helm 内置以下定时 ESI 同步任务：

| 任务 | 默认周期 | 说明 |
|------|---------|------|
| `sync_character_info` | 1 小时 | 同步角色基本信息 |
| `sync_character_skills` | 1 小时 | 同步技能 |
| `sync_character_assets` | 6 小时 | 同步资产 |
| `sync_character_wallet` | 30 分钟 | 同步钱包流水 |
| `sync_character_mail` | 30 分钟 | 同步邮件 |
| `sync_character_notifications` | 30 分钟 | 同步通知 |
| `sync_corporation_members` | 1 小时 | 同步军团成员 |
| `sync_corporation_assets` | 6 小时 | 同步军团资产 |

这些任务按 **Bucket（桶）** 分批执行，每个桶包含若干角色，批量拉取 ESI 数据，避免超出 CCP 速率限制。

## Bucket 配置

Helm 将角色分配到不同的 Bucket，每个 Bucket 按配置的间隔触发一次 ESI 刷新。Bucket 大小由 `.env` 中的 `ESI_REFRESH_BUCKET_SIZE` 控制（默认 50）。

## 手动触发任务

管理员可以通过 API 手动触发特定任务（无需等待下一个定时周期）：

```bash
# 立即同步特定角色的数据
curl -X POST http://your-helm/api/v1/admin/tasks/sync-character \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"character_id": 123456789}'
```

## 插件任务

已启用的插件注册的 Celery 任务也会出现在任务历史中，任务名称通常为 `{plugin_name}.{task_name}` 格式。

!!! note "Worker 热注册"
    热安装/启用插件时，Helm 会向运行中的 Worker 广播控制命令，使其导入插件任务模块并立即生效——**通常无需重启 Worker**。仅当 Worker 在插件安装*之前*已启动且未收到广播（如安装时 Worker 离线）时，才需软重启补登记：

    ```bash
    celery -A app.tasks.celery_app worker --loglevel=info
    ```

### 插件定时任务

插件可通过 `get_beat_schedule()` 声明周期性定时任务。安装/启用后，这些任务会**热加载**进运行中的 Celery Beat（无需重启 Beat），并与内置定时任务一同出现在「定时任务」列表中，条目名为 `{plugin_name}:{条目键}`。管理员可像内置任务一样**在运行时覆盖其执行间隔**或手动触发。禁用/卸载插件时对应条目自动移除。

## Worker 状态监控

通过 Celery 的 Flower 工具可以实时监控 Worker 状态（需单独安装）：

```bash
pip install flower
celery -A app.tasks.celery_app flower --port=5555
# → http://localhost:5555
```

或通过 Redis CLI 查看队列积压：

```bash
redis-cli llen celery
```

## 常见问题

**Q：任务一直处于 `running` 状态？**

A：Worker 可能已崩溃。检查 Worker 进程是否在运行，重启 Worker 后任务状态会自动更新。

**Q：ESI 数据很久没更新？**

A：检查以下项目：
1. Celery Worker 是否正在运行
2. Redis 连接是否正常
3. ESI 令牌是否过期（用户需重新 SSO 授权）
4. CCP ESI 服务是否正常（访问 [ESI 状态页](https://esi.evetech.net/status.json)）
