# 7. 注册权限

```python
from app.plugins.base import PermissionDef

class MyPlugin(HelmPlugin):
    def get_permissions(self) -> list[PermissionDef]:
        return [
            PermissionDef("fleet-tracker.read",  "global", "读取舰队数据"),
            PermissionDef("fleet-tracker.admin", "global", "管理舰队记录"),
        ]
```

`scope_type` 可选：`"global"` / `"character"` / `"corporation"` / `"alliance"`
