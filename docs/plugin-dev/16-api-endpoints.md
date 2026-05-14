# 16. API 端点参考

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/admin/plugins/` | 列出所有插件 |
| `GET` | `/api/v1/admin/plugins/events` | SSE 事件流（`?token=<jwt>`） |
| `POST` | `/api/v1/admin/plugins/install` | 从 PyPI 安装 |
| `POST` | `/api/v1/admin/plugins/install/upload` | 上传 `.whl` 安装 |
| `POST` | `/api/v1/admin/plugins/{name}/enable` | 启用插件 |
| `POST` | `/api/v1/admin/plugins/{name}/disable` | 禁用插件 |
| `DELETE` | `/api/v1/admin/plugins/{name}` | 卸载（`?pip_remove=false`） |
| `GET` | `/api/v1/admin/plugins/{name}/status` | 状态检查 |
| `GET` | `/api/v1/plugins/` | **公开**：已启用插件清单 |
| `GET` | `/api/v1/plugins/{name}/ui-schema` | **公开**：插件 UI Schema |
| `*` | `/api/v1/plugins/{name}/*` | 插件自己注册的端点 |
