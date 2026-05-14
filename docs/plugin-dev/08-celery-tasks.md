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

> Worker 需软重启后才能执行新注册的任务。
