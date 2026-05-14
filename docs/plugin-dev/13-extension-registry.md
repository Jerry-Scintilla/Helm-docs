# 13. 插件间通信（ExtensionRegistry）

```python
from app.plugins.registry import extension_registry

class MyPlugin(HelmPlugin):
    def on_enable(self, ctx):
        extension_registry.register("my-plugin.data_provider", self, self.name)

    def get_data(self) -> list[dict]:
        return [...]
```

## 消费方

```python
providers = extension_registry.get_all("my-plugin.data_provider")
for p in providers:
    data = p.get_data()
```

`disable_plugin` 时框架自动调用 `unregister_plugin(name)`，无需在 `on_disable` 中手动注销。
