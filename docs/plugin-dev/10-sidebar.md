# 10. 侧边栏菜单

```python
from app.plugins.base import SidebarItem

class MyPlugin(HelmPlugin):
    def get_sidebar_items(self) -> list[SidebarItem]:
        return [
            SidebarItem(
                label="舰队追踪",
                route="/plugins/fleet-tracker/fleets",  # 与 UIPage.path 对应
                icon="⚔",
                order=200,
            ),
        ]
```

`route` 应指向插件的第一个 UI 页面路径，使用完整路径（含 `/plugins/{name}/`）。
