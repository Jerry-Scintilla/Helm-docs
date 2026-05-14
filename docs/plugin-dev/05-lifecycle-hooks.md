# 5. 生命周期钩子

所有钩子接收 `PluginContext` 参数。

```python
@dataclass
class PluginContext:
    db_session_factory: Any   # AsyncSessionLocal
    esi_client: Any           # 保留字段
```

| 钩子 | 何时调用 |
|------|---------|
| `on_install(ctx)` | 首次安装成功后 |
| `on_enable(ctx)` | 启用时（含首次安装） |
| `on_disable(ctx)` | 禁用时（含卸载前） |
| `on_uninstall(ctx)` | 卸载时 |
| `on_character_updated(character_id, ctx)` | ESI 角色同步完成 |
| `on_corporation_updated(corporation_id, ctx)` | ESI 公司同步完成 |
