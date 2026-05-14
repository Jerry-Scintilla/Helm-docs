# 11. iframe 前端

插件可以随 Python 包附带完整的前端项目。Helm 用 `<iframe>` 挂载插件页面，通过轻量的 `postMessage` SDK 传递认证令牌。插件前端与宿主 SPA 完全隔离，可以使用任意前端技术栈。

---

## 工作原理

```
Helm 主壳 (Vue 3 SPA)
└── shell-content
    └── <iframe src="/plugin-ui/{name}/index.html">
            └── 插件前端（任意技术栈）
                    ↕ postMessage
                HelmSDK（helm-sdk.js）
```

**认证流程：**

1. Helm 发现插件有 `frontend_url`，注册 Vue 路由
2. 用户导航到插件页时，iframe 加载插件 HTML
3. 插件调用 `HelmSDK.init()` → 发送 `helm:ready`
4. Helm 收到后回送 `helm:init`，携带 `{ token, apiBase }`
5. 插件用 `HelmSDK.getToken()` 获取 JWT，即可调用 Helm API

---

## Sandbox 约束

Helm 以如下属性挂载插件 iframe：

```html
<iframe sandbox="allow-scripts allow-same-origin allow-forms" ...>
```

### 控制台警告（预期行为）

浏览器会在控制台输出：

```
An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.
```

这是浏览器对 `allow-scripts + allow-same-origin` 组合的结构性警告，**不影响功能**，插件开发者无需处理，也无法消除。

### 被禁用的 API

由于 sandbox 未包含 `allow-modals` 和 `allow-popups`，以下调用在插件前端中**不可用**：

| 被禁用的 API | 替代方案 |
|------------|--------|
| `alert()` | HTML `<dialog>` 元素或 CSS 遮罩层 |
| `confirm()` | HTML `<dialog>` 元素加确认/取消按钮 |
| `prompt()` | 内嵌输入表单 |
| `window.open()` | `HelmSDK.navigate()` 或在 iframe 内渲染内容 |

### 推荐的弹窗实现

用原生 `<dialog>` 元素替代 `confirm()`：

```html
<!-- HTML -->
<dialog id="confirm-dialog">
  <p id="confirm-msg"></p>
  <button id="confirm-ok">确认</button>
  <button id="confirm-cancel">取消</button>
</dialog>

<script>
function showConfirm(message, onOk) {
  var dlg = document.getElementById('confirm-dialog')
  document.getElementById('confirm-msg').textContent = message
  dlg.showModal()
  document.getElementById('confirm-ok').onclick = function () { dlg.close(); onOk() }
  document.getElementById('confirm-cancel').onclick = function () { dlg.close() }
}

// 使用
showConfirm('确认删除此记录？', function () {
  // 执行删除
})
</script>
```

或使用 CSS 遮罩层（兼容性更广）：

```html
<div id="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:1000; display:flex; align-items:center; justify-content:center;">
  <div style="background:#2a2a28; border-radius:8px; padding:24px; min-width:280px;">
    <p id="modal-msg" style="margin-bottom:16px;"></p>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button id="modal-cancel">取消</button>
      <button id="modal-ok">确认</button>
    </div>
  </div>
</div>
```

---

## 快速起步（原生 HTML）

最简单的插件前端——无需任何构建工具：

**`my_plugin/frontend/dist/index.html`**

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>My Plugin</title>
  <script src="/plugin-sdk/helm-sdk.js"></script>
  <style>
    body { font-family: sans-serif; background: #1e1e1c; color: #b0aea5; padding: 24px; }
  </style>
</head>
<body>
  <h2>插件数据</h2>
  <div id="content">加载中…</div>

  <script>
    HelmSDK.init(function (ctx) {
      fetch(ctx.apiBase + '/api/v1/plugins/my-plugin/data', {
        headers: { Authorization: 'Bearer ' + ctx.token }
      })
        .then(r => r.json())
        .then(data => {
          document.getElementById('content').textContent = JSON.stringify(data, null, 2)
        })
    })
  </script>
</body>
</html>
```

---

## HelmPlugin 前端方法

在 `plugin.py` 中声明前端文件位置：

```python
from pathlib import Path
from app.plugins.base import HelmPlugin, SidebarItem

class MyPlugin(HelmPlugin):
    name = "my-plugin"
    ...

    def get_static_dir(self):
        """指向 Python 包内的编译前端目录（必须含 index.html）"""
        return Path(__file__).parent / "frontend" / "dist"

    def get_frontend_dev_url(self):
        """开发模式下使用此 URL 替代静态文件（仅 app_env=development 时生效）"""
        return "http://localhost:5174"

    def get_sidebar_items(self):
        return [SidebarItem("我的插件", "/plugins/my-plugin", "🔌", order=200)]
```

`get_frontend_dev_url()` 在生产环境（`app_env != "development"`）会被忽略，插件开发者控制是否返回非 `None` 值。

---

## 带构建工具的前端（Vite）

如果需要 Vue/React 或 TypeScript：

**目录结构：**

```
helm-plugin-my-plugin/
├── pyproject.toml
└── my_plugin/
    ├── plugin.py
    ├── frontend/
    │   ├── dist/           ← 构建输出，打包进 wheel
    │   ├── src/
    │   │   └── main.ts
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.ts
    └── migrations/
```

**`pyproject.toml` 需包含前端产物：**

```toml
[tool.setuptools.package-data]
my_plugin = [
    "frontend/dist/**",
    "migrations/versions/*.py",
    "migrations/alembic.ini",
    "migrations/env.py",
]
```

**`vite.config.ts` 推荐配置（避免与 Helm 主 SPA 冲突）：**

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  // 插件前端使用独立端口
  server: { port: 5174 },
  // 构建到 dist/，路径相对（iframe 内使用绝对路径从 API 获取数据）
  build: { outDir: 'dist', base: './' },
})
```

**开发工作流：**

```bash
# 终端 1：Helm 后端
uvicorn app.main:app --reload

# 终端 2：Helm 前端
cd frontend && npm run dev

# 终端 3：插件前端（热重载）
cd my_plugin/frontend && npm run dev
# → 运行在 http://localhost:5174

# plugin.py 中 get_frontend_dev_url 返回 "http://localhost:5174"
# Helm 检测到 app_env=development，直接将 iframe src 指向该地址
```

---

## HelmSDK API 参考

插件 HTML 引入 SDK：

```html
<script src="/plugin-sdk/helm-sdk.js"></script>
```

| 方法 | 说明 |
|------|------|
| `HelmSDK.init(onReady)` | 初始化，`onReady(ctx)` 在收到 token 后调用 |
| `HelmSDK.getToken()` | 返回当前 JWT access_token |
| `HelmSDK.getApiBase()` | 返回 API 基础 URL，如 `"http://localhost:8000"` |
| `HelmSDK.navigate(routeName)` | 让 Helm 主应用导航到指定 Vue 路由名 |
| `HelmSDK.requestTokenRefresh()` | 请求主窗口刷新 token（401 后使用） |

**完整用法示例：**

```javascript
HelmSDK.init(function (ctx) {
  // ctx.token    ← JWT Bearer token
  // ctx.apiBase  ← "http://localhost:8000"

  // 调用插件 API
  fetch(ctx.apiBase + '/api/v1/plugins/my-plugin/records', {
    headers: { Authorization: 'Bearer ' + HelmSDK.getToken() }
  })
  .then(r => {
    if (r.status === 401) {
      // 令牌过期时请求刷新
      HelmSDK.requestTokenRefresh()
      return
    }
    return r.json()
  })
  .then(renderData)

  // 跳转到 Helm 内其他页面
  document.getElementById('go-home').onclick = function () {
    HelmSDK.navigate('dashboard')
  }
})
```

---

## postMessage 协议

| 方向 | type | payload |
|------|------|---------|
| iframe → parent | `helm:ready` | — |
| parent → iframe | `helm:init` | `{ token, apiBase }` |
| iframe → parent | `helm:navigate` | `{ route: string }` |
| iframe → parent | `helm:token:expired` | — |
| parent → iframe | `helm:token:refreshed` | `{ token }` |

---

## 发布 wheel 时的注意事项

- `frontend/dist/` 必须在打包前已构建完毕（在 CI 中先 `npm run build`）
- `pyproject.toml` 的 `package-data` 必须包含 `"frontend/dist/**"`
- 如果开发时设置了 `get_frontend_dev_url()`，发布前将其改为返回 `None`
- wheel 不包含 `frontend/src/`、`node_modules/` 等开发文件（`.gitignore` / `.npmignore` 控制）
