# 14. 本地测试流程

```bash
# 1. editable 安装
pip install -e ./helm-plugin-fleet-tracker

# 2. 通过 API 安装（后端运行中时）
curl -X POST http://localhost:8000/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "helm-plugin-fleet-tracker"}'

# 3. 验证 API 端点
curl http://localhost:8000/api/v1/plugins/fleet-tracker/fleets \
  -H "Authorization: Bearer <jwt>"

# 4. 验证插件状态
curl http://localhost:8000/api/v1/admin/plugins/fleet-tracker/status \
  -H "Authorization: Bearer <jwt>"
# 期望：{"status": "enabled", "is_loaded": true, "router_mounted": true}

# 5. 验证 SDK 可访问（有前端的插件）
curl http://localhost:8000/plugin-sdk/helm-sdk.js
# 期望：返回 helm-sdk.js 内容（200）

# 6. 验证插件静态文件（有前端的插件）
curl http://localhost:8000/plugin-ui/fleet-tracker/index.html
# 期望：返回插件 index.html 内容（200）

# 7. 验证前端路由（浏览器中打开）
# http://localhost:5173/plugins/fleet-tracker
# 侧边栏「插件」分组应出现菜单项，内容区显示 iframe

# 8. 禁用 / 重新启用
curl -X POST http://localhost:8000/api/v1/admin/plugins/fleet-tracker/disable \
  -H "Authorization: Bearer <jwt>"
curl -X POST http://localhost:8000/api/v1/admin/plugins/fleet-tracker/enable \
  -H "Authorization: Bearer <jwt>"

# 9. 卸载
curl -X DELETE "http://localhost:8000/api/v1/admin/plugins/fleet-tracker?pip_remove=false" \
  -H "Authorization: Bearer <jwt>"
```

## 前端热重载开发

在 `plugin.py` 中设置 dev server URL：

```python
def get_frontend_dev_url(self):
    return "http://localhost:5174"
```

然后在插件的 `frontend/` 目录下启动开发服务器（以 Vite 为例）：

```bash
cd helm-plugin-fleet-tracker/fleet_tracker/frontend
npm run dev
# → http://localhost:5174 启动，修改文件自动热重载
```

Helm 后端在 `app_env=development` 时会自动将 iframe `src` 指向 dev server，无需重装插件。
