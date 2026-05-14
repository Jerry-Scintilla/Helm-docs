# 9. ESI 作用域声明

```python
class MyPlugin(HelmPlugin):
    def get_esi_scopes(self) -> list[str]:
        return ["esi-fleets.read_fleet.v1"]
```
