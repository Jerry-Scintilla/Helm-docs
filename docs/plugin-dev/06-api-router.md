# 6. 注册 API 路由

插件 API 挂载在 `/api/v1/plugins/{name}/` 前缀下。

```python
from fastapi import APIRouter, Depends
from app.core.permissions import require_permission

class MyPlugin(HelmPlugin):
    name = "fleet-tracker"

    def get_router(self) -> APIRouter:
        r = APIRouter()

        @r.get("/fleets")
        async def list_fleets():
            return []

        @r.post("/fleets/{fleet_id}/approve")
        async def approve_fleet(
            fleet_id: int,
            _=Depends(require_permission("fleet-tracker.admin")),
        ):
            ...
            return {"message": "已批准"}

        return r
```

最终端点：`GET /api/v1/plugins/fleet-tracker/fleets`
