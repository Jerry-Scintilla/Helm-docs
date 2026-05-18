# 插件管理

Helm 的插件系统支持热加载 — 安装或启用插件后，API 路由立即生效，**无需重启服务**。

## 插件列表

进入 **管理后台 → 插件管理**（`/admin/plugins`），可以看到所有已安装插件的列表：

![插件管理](https://raw.githubusercontent.com/Helm-docs/img/main/screenshot/%E6%8F%92%E4%BB%B6%E7%AE%A1%E7%90%86%EF%BC%88%E4%B8%AD%E6%96%87%EF%BC%89.jpeg)

| 列 | 说明 |
|----|------|
| 名称 | 插件唯一 ID（URL slug） |
| 版本 | 插件版本号 |
| 状态 | `enabled`（已启用）/ `disabled`（已禁用）/ `error`（错误） |
| 路由挂载 | 路由是否成功热挂载 |
| 作者 | 插件作者 |
| 描述 | 插件功能简介 |

## 安装插件

安装为**异步操作**：请求提交后立即返回，后台执行 pip install、数据库迁移、路由挂载等步骤。管理界面通过 SSE 实时推送安装日志，安装完成后自动弹出成功提示。

=== "从 PyPI 安装"

    1. 在插件列表页点击 **安装插件**
    2. 输入 PyPI 包名，例如 `helm-plugin-market-scanner`
    3. 点击 **安装** — 后台执行 `pip install` 并自动加载插件
    4. 安装成功后插件出现在列表中，状态为 `enabled`（已启用）

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

插件安装后默认为**启用**状态。若手动禁用后需要重新启用：

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

卸载为**异步操作**：请求提交后立即返回 `204`，后台按顺序执行：禁用插件 → 降级数据库迁移（删除插件表）→ pip uninstall → 删除数据库记录。操作完成后，管理界面通过 SSE 收到 `plugin.uninstalled` 事件，自动刷新列表并弹出成功提示。

1. 点击插件的 **卸载** 按钮
2. 在确认弹窗中确认操作
3. 等待成功提示出现（表示后台已完成全部清理）

**API 方式：**
```bash
curl -X DELETE http://your-helm/api/v1/admin/plugins/market-scanner \
  -H "Authorization: Bearer <admin-token>"
```

!!! warning "卸载不可逆"
    卸载会同时 pip uninstall 包并删除插件的数据库表。若需保留数据，请在卸载前手动备份相关表。

## 查看插件状态

```bash
curl http://your-helm/api/v1/admin/plugins/market-scanner/status \
  -H "Authorization: Bearer <admin-token>"
```

返回示例：
```json
{
  "name": "market-scanner",
  "status": "enabled",
  "is_enabled": true,
  "is_loaded": true,
  "router_mounted": true,
  "error_message": null
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
    如果插件携带数据库迁移脚本，Helm 在安装时会自动通过独立子进程执行迁移。若迁移失败，安装将回滚（pip uninstall），插件不会被激活。

!!! tip "开发者"
    如果你是插件开发者，请参阅 [插件开发指南](../plugin-dev/index.md) 了解如何构建和发布插件。下载 [AI 脚手架 Skill](../downloads.md) 可使用 Claude Code 一键生成插件骨架。
