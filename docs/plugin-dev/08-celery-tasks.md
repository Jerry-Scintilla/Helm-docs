# 8. 注册 Celery 任务

```python
class MyPlugin(HelmPlugin):
    def get_tasks(self) -> list[str]:
        return ["fleet_tracker.tasks"]
```

任务模块（`fleet_tracker/tasks.py`）：

```python
from app.tasks.celery_app import celery_app   # 使用服务端实例，不要 new Celery()

@celery_app.task(name="fleet_tracker.sync_pap")
def sync_pap():
    ...
```

> 热安装/启用插件时，Helm 会向运行中的 Worker 广播控制命令，让其导入插件任务模块并重建调度策略——**无需重启 Worker**。仅当 Worker 进程在插件安装*之前*已启动且未收到广播（如 Worker 当时离线）时，才需软重启补登记。

## 定时任务（Celery Beat）

插件通过 `get_beat_schedule()` 声明周期性任务，结构与 Celery 原生 `beat_schedule` 完全一致：

```python
class MyPlugin(HelmPlugin):
    def get_tasks(self) -> list[str]:
        return ["fleet_tracker.tasks"]

    def get_beat_schedule(self) -> dict:
        return {
            "sync-pap": {
                "task": "fleet_tracker.sync_pap",  # 必须是 get_tasks() 已注册的任务名
                "schedule": 300.0,                 # 间隔秒数（float）
                "options": {"queue": "default"},   # 可选：路由队列等
            },
        }
```

工作原理：

- 键（如 `sync-pap`）是插件内的本地条目名，Helm 会命名空间化为 `{插件名}:{键}`（如 `fleet_tracker:sync-pap`）。
- 安装/启用插件时，Helm 把该调度写入一个 Redis 哈希；运行中的 `HelmBeatScheduler` 每个 tick 轮询并热加载——**无需重启 Beat**。
- 禁用/卸载插件时自动撤除对应条目。
- 应用启动加载插件时会重新推送，因此即使 Redis 被清空，Beat 也能自愈。

> `task` 必须是 `get_tasks()` 所列模块中已用 `@celery_app.task(name=...)` 注册的任务名，否则 Beat 派发后 Worker 会以 "unregistered task" 拒绝执行。

### 运行时调整执行周期

插件定时任务和内置定时任务一样，会出现在后台「任务管理 → 定时任务」中，管理员可在运行时覆盖其执行间隔（覆盖值存于 Redis，Beat 下一 tick 生效，重置后恢复插件声明的默认值）。条目名即命名空间化后的 `{插件名}:{键}`。
