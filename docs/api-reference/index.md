# API 参考

Helm 提供 RESTful API，所有端点均以 `/api/v1` 为前缀。

## 认证

所有受保护的 API 端点均需要在请求头中携带 JWT Bearer Token 或 API Token：

```
Authorization: Bearer <token>
```

- **JWT Token**：通过 EVE SSO 登录后由 Helm 颁发，有效期短（默认 60 分钟）
- **API Token**：在账户设置中生成，有效期长，适合程序化访问

---

## 认证端点

### `GET /api/v1/auth/login`
发起 EVE SSO 登录流程，重定向到 CCP 授权页面。

### `GET /api/v1/auth/callback`
SSO 回调端点，处理 CCP 授权码，颁发 JWT Token。

### `POST /api/v1/auth/refresh`
刷新 JWT Token。

### `POST /api/v1/auth/logout`
注销当前会话。

---

## 角色端点

### `GET /api/v1/characters/me`
获取当前登录用户绑定的角色列表。

**响应示例：**
```json
[
  {
    "character_id": 123456789,
    "character_name": "My Character",
    "corporation_id": 987654321,
    "corporation_name": "My Corp",
    "alliance_id": 111222333,
    "alliance_name": "My Alliance"
  }
]
```

### `GET /api/v1/characters/{character_id}`
获取指定角色的详细信息（需权限）。

### `GET /api/v1/characters/{character_id}/skills`
获取角色技能数据。

### `GET /api/v1/characters/{character_id}/assets`
获取角色资产列表。

### `GET /api/v1/characters/{character_id}/wallet`
获取角色钱包流水。

### `GET /api/v1/characters/{character_id}/mail`
获取角色邮件列表。

### `GET /api/v1/characters/{character_id}/notifications`
获取角色系统通知。

---

## 军团端点

### `GET /api/v1/corporations/{corporation_id}`
获取军团基本信息。

### `GET /api/v1/corporations/{corporation_id}/members`
获取军团成员列表（需 `corporation.view_members` 权限）。

### `GET /api/v1/corporations/{corporation_id}/wallet`
获取军团钱包信息（需 `corporation.view_finances` 权限）。

### `GET /api/v1/corporations/{corporation_id}/assets`
获取军团资产（需 `corporation.view_assets` 权限）。

---

## 联盟端点

### `GET /api/v1/alliances/{alliance_id}`
获取联盟基本信息。

### `GET /api/v1/alliances/{alliance_id}/corporations`
获取联盟成员军团列表。

---

## 插件端点（公开）

### `GET /api/v1/plugins/`
获取已启用的插件列表（含前端 URL）。

**响应示例：**
```json
[
  {
    "name": "market-scanner",
    "version": "0.1.0",
    "description": "EVE 市场扫描插件",
    "frontend_url": "/plugin-ui/market-scanner/",
    "sidebar_items": [
      {"label": "市场扫描", "route": "/plugins/market-scanner", "icon": "📈"}
    ]
  }
]
```

### `* /api/v1/plugins/{name}/*`
插件自定义端点，由各插件的 `APIRouter` 定义。具体端点参见各插件的文档。

---

## 插件端点（管理员）

所有管理端点需要 `admin.manage_plugins` 权限。

### `GET /api/v1/admin/plugins/`
获取所有已安装插件列表（含禁用插件）。

### `POST /api/v1/admin/plugins/install`
从 PyPI 安装插件。

**请求体：**
```json
{"package_name": "helm-plugin-market-scanner"}
```

### `POST /api/v1/admin/plugins/install/upload`
上传 `.whl` 文件安装插件（`multipart/form-data`，字段名 `file`）。

### `POST /api/v1/admin/plugins/{name}/enable`
启用插件（路由立即热挂载）。

### `POST /api/v1/admin/plugins/{name}/disable`
禁用插件（路由立即卸载）。

### `DELETE /api/v1/admin/plugins/{name}`
卸载插件。查询参数 `pip_remove=true` 同时执行 pip uninstall。

### `GET /api/v1/admin/plugins/{name}/status`
查询插件详细状态（is_loaded、router_mounted、权限列表等）。

---

## 静态资源端点

### `GET /plugin-sdk/helm-sdk.js`
Helm 前端 SDK 脚本，供插件 iframe 内引用。

### `GET /plugin-ui/{name}/{file_path}`
插件静态文件服务，SPA fallback 到 `index.html`。

---

## 响应格式

所有 API 返回 JSON 格式，错误响应统一结构：

```json
{
  "detail": "错误描述信息"
}
```

常见 HTTP 状态码：

| 状态码 | 含义 |
|--------|------|
| `200` | 成功 |
| `201` | 创建成功 |
| `400` | 请求参数错误 |
| `401` | 未认证（Token 缺失或过期） |
| `403` | 权限不足 |
| `404` | 资源不存在 |
| `422` | 请求体校验失败 |
| `500` | 服务器内部错误 |

---

## 交互式文档

Helm 运行时提供自动生成的 API 文档（通过 FastAPI）：

- **Swagger UI**: `http://your-helm/docs`
- **ReDoc**: `http://your-helm/redoc`
- **OpenAPI JSON**: `http://your-helm/openapi.json`
