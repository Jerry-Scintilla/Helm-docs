# 插件管理

Helm 的插件系统支持热加载 — 安装或启用插件后，API 路由立即生效，**无需重启服务**。

## 插件列表

进入 **管理后台 → 插件管理**（`/admin/plugins`），可以看到所有已安装插件的列表：

| 列 | 说明 |
|----|------|
| 名称 | 插件唯一 ID（URL slug） |
| 版本 | 插件版本号 |
| 状态 | `enabled`（已启用）/ `disabled`（已禁用） |
| 路由挂载 | 路由是否成功热挂载 |
| 作者 | 插件作者 |
| 描述 | 插件功能简介 |

## 安装插件

=== "从 PyPI 安装"

    1. 在插件列表页点击 **安装插件**
    2. 输入 PyPI 包名，例如 `helm-plugin-market-scanner`
    3. 点击 **安装** — Helm 后台执行 `pip install` 并自动加载插件
    4. 安装完成后插件出现在列表中（状态为 `disabled`）

    **API 方式：**
    ```bash
    curl -X POST http://your-helm/api/v1/admin/plugins/install \
      -H "Authorization: Bearer <admin-token>" \
      -H "Content-Type: application/json" \
      -d '{"package_name": "helm-plugin-market-scanner"}'
    ```

=== "上传 .whl 包"

    1. 点击 **上传插件包**
    2. 选择 `.whl` 文件（例如 `helm_plugin_market_scanner-0.1.0-py3-none-any.whl`）
    3. 上传完成后 Helm 自动安装并加载

    **API 方式：**
    ```bash
    curl -X POST http://your-helm/api/v1/admin/plugins/install/upload \
      -H "Authorization: Bearer <admin-token>" \
      -F "file=@helm_plugin_market_scanner-0.1.0-py3-none-any.whl"
    ```

## 启用插件

插件安装后默认为 **禁用** 状态，需要手动启用：

1. 在插件列表中找到目标插件
2. 点击 **启用** 按钮
3. 插件的 API 路由立即挂载到 `/api/v1/plugins/{name}/`
4. 插件的侧边栏菜单项立即出现在前端

**API 方式：**
```bash
curl -X POST http://your-helm/api/v1/admin/plugins/market-scanner/enable \
  -H "Authorization: Bearer <admin-token>"
```

## 禁用插件

禁用后，插件路由立即卸载，侧边栏菜单项消失，但插件数据和配置保留：

1. 点击插件的 **禁用** 按钮
2. 确认操作

**API 方式：**
```bash
curl -X POST http://your-helm/api/v1/admin/plugins/market-scanner/disable \
  -H "Authorization: Bearer <admin-token>"
```

## 卸载插件

卸载将移除插件记录。可选择是否同时从 Python 环境中卸载包：

1. 先禁用插件
2. 点击 **卸载** 按钮
3. 选择是否 pip uninstall（保留可以保留插件数据，便于重新安装时恢复）

**API 方式：**
```bash
# 仅卸载插件记录，保留 pip 包
curl -X DELETE "http://your-helm/api/v1/admin/plugins/market-scanner?pip_remove=false" \
  -H "Authorization: Bearer <admin-token>"

# 同时 pip uninstall
curl -X DELETE "http://your-helm/api/v1/admin/plugins/market-scanner?pip_remove=true" \
  -H "Authorization: Bearer <admin-token>"
```

## 查看插件状态

```bash
curl http://your-helm/api/v1/admin/plugins/market-scanner/status \
  -H "Authorization: Bearer <admin-token>"
```

返回示例：
```json
{
  "name": "market-scanner",
  "version": "0.1.0",
  "status": "enabled",
  "is_loaded": true,
  "router_mounted": true,
  "permissions": ["market-scanner.read", "market-scanner.admin"],
  "esi_scopes": ["esi-markets.read_orders_from_structure.v1"]
}
```

## 注意事项

!!! warning "Celery Worker 与插件任务"
    如果插件注册了 Celery 后台任务，启用插件后需要**重启 Celery Worker** 才能使任务生效。API 路由是热加载的，但 Celery 任务需要 Worker 进程重新发现。

    ```bash
    # 重启 Worker
    celery -A app.tasks.celery_app worker --loglevel=info
    ```

!!! warning "数据库迁移"
    如果插件携带数据库迁移脚本，Helm 在插件安装时会自动执行迁移。若迁移失败，插件将无法启用。

!!! tip "开发者"
    如果你是插件开发者，请参阅 [插件开发指南](../plugin-dev/index.md) 了解如何构建和发布插件。下载 [AI 脚手架 Skill](../downloads.md) 可使用 Claude Code 一键生成插件骨架。
