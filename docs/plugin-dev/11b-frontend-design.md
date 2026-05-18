# 11b. 插件前端设计规范

Helm 的视觉语言来自 `Markdown/DESIGN.md`（设计系统完整参考）。插件前端运行在 iframe 中，与 Helm 主壳共享视觉风格，**必须**遵循本文档的颜色、字体和组件规范，不得在规范之外自行引入颜色或字体。

---

## 设计哲学

Helm 的界面采用 **温暖中性调色板**——所有灰色均带黄褐色调，没有任何冷蓝灰。品牌色是 **赤陶红（Terracotta, `#c96442`）**，刻意选用一种有机感、非科技感的暖橙棕，只用于主要 CTA 和最高优先级的品牌时刻。

插件 UI 默认应采用**深色表面**方案（Deep Dark 底色），与 Helm 主壳的整体暗色环境保持一致。

---

## 一、颜色 Token

### 深色表面（默认方案）

| CSS 变量 | Token 名称 | 十六进制 | 使用角色 |
|---------|-----------|---------|---------|
| `--bg` | Deep Dark | `#141413` | 页面背景 |
| `--surface` | Dark Surface | `#30302e` | 卡片、容器、浮层 |
| `--border` | Border Dark | `#3d3d3a` | 边框、分割线 |
| `--text-primary` | Ivory | `#faf9f5` | 主标题、强调文字 |
| `--text-body` | Warm Silver | `#b0aea5` | 正文、表格内容 |
| `--text-muted` | Stone Gray | `#87867f` | 表头、次要说明 |
| `--text-dim` | Olive Gray | `#5e5d59` | 空状态、最弱提示 |
| `--brand` | Terracotta Brand | `#c96442` | 主 CTA 按钮、高亮徽章 |
| `--brand-light` | Coral Accent | `#d97757` | 深色背景上的链接文字 |
| `--error-text` | Error Crimson | `#b53333` | 错误文字 |
| `--error-bg` | — | `#2a1a1a` | 错误消息背景 |
| `--focus` | Focus Blue | `#3898ec` | 输入框聚焦环（唯一冷色） |

### 浅色表面（可选，适用于内容展示型页面）

| CSS 变量 | Token 名称 | 十六进制 | 使用角色 |
|---------|-----------|---------|---------|
| `--bg` | Parchment | `#f5f4ed` | 页面背景 |
| `--surface` | Ivory | `#faf9f5` | 卡片表面 |
| `--border` | Border Cream | `#f0eee6` | 标准边框 |
| `--border-prominent` | Border Warm | `#e8e6dc` | 突出边框、分节线 |
| `--text-primary` | Anthropic Near Black | `#141413` | 主标题、主文字 |
| `--text-body` | Olive Gray | `#5e5d59` | 正文 |
| `--text-muted` | Stone Gray | `#87867f` | 次要说明 |
| `--btn-secondary-bg` | Warm Sand | `#e8e6dc` | 次级按钮背景 |
| `--btn-secondary-text` | Charcoal Warm | `#4d4c48` | 次级按钮文字 |

> **核心约束**：调色板中的每一个灰色都必须带黄褐色调。禁止使用 `#6b7280`、`#9ca3af`、`#718096` 等冷蓝灰。

---

## 二、CSS 自定义属性模板

在每个插件的 `<style>` 中声明以下根变量：

```css
:root {
  /* 背景与表面 */
  --bg:           #141413;
  --surface:      #30302e;
  --border:       #3d3d3a;

  /* 文字层级 */
  --text-primary: #faf9f5;
  --text-body:    #b0aea5;
  --text-muted:   #87867f;
  --text-dim:     #5e5d59;

  /* 品牌与状态 */
  --brand:        #c96442;
  --brand-light:  #d97757;
  --error-text:   #b53333;
  --error-bg:     #2a1a1a;
  --focus:        #3898ec;

  /* 圆角 */
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    16px;

  /* 字体 */
  --font-serif:   'Anthropic Serif', Georgia, serif;
  --font-sans:    'Anthropic Sans', system-ui, sans-serif;
  --font-mono:    'Anthropic Mono', monospace;
}
```

---

## 三、字体规范

Helm 全局加载 `Anthropic Serif`、`Anthropic Sans`、`Anthropic Mono`，插件 iframe 可直接使用这些字体名称，无需额外引入。**必须**声明 fallback。

```css
font-family: var(--font-serif);  /* 标题 */
font-family: var(--font-sans);   /* 正文 / UI */
font-family: var(--font-mono);   /* 代码 / 终端 */
```

### 字号与行高层级

| 用途 | 字族 | 大小 | 字重 | 行高 |
|------|------|------|------|------|
| 页面 / 章节标题 | Serif | `1.6rem` | 500 | 1.20 |
| 卡片 / 组件标题 | Serif | `1.3rem` | 500 | 1.20 |
| 正文 / UI 文字 | Sans | `1rem` | 400 | 1.60 |
| 次要正文 | Sans | `0.94rem` | 400 | 1.60 |
| 说明 / 元数据 | Sans | `0.88rem` | 400 | 1.43 |
| 表格列头 | Sans | `0.8rem` | 500 | 1.25，uppercase，`letter-spacing: 0.05em` |
| 代码 / 终端 | Mono | `0.94rem` | 400 | 1.60 |

> Serif 字重上限为 **500**，禁止使用 600、700 或 bold。

---

## 四、组件规范

### 4.1 按钮

```css
/* 主 CTA */
.btn-primary {
  background: var(--brand);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--brand) 0px 0px 0px 0px, var(--brand) 0px 0px 0px 1px;
}
.btn-primary:hover { opacity: 0.90; }

/* 次级（深色场景）*/
.btn-secondary {
  background: var(--surface);
  color: var(--text-body);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 1rem;
  cursor: pointer;
}

/* 次级（浅色场景）*/
.btn-secondary-light {
  background: #e8e6dc;
  color: #4d4c48;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0px 12px 0px 8px;
  box-shadow: #e8e6dc 0px 0px 0px 0px, #d1cfc5 0px 0px 0px 1px;
}

/* 危险操作 */
.btn-danger {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-text);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
}
```

> **深度规则**：使用 `box-shadow: 0px 0px 0px 1px` 的**环形阴影**表达交互状态，不使用传统投影。

---

### 4.2 卡片与容器

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);   /* 8px，标准卡片 */
  padding: 24px;
}

.card-featured {
  border-radius: var(--radius-lg);   /* 16px，特色 / 主要内容卡片 */
  box-shadow: rgba(0,0,0,0.05) 0px 4px 24px;
}
```

---

### 4.3 表格

```css
table { width: 100%; border-collapse: collapse; }
thead tr { border-bottom: 1px solid var(--border); }
tbody tr { border-bottom: 1px solid var(--border); }
tbody tr:last-child { border-bottom: none; }

th {
  text-align: left;
  padding: 8px 12px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 10px 12px;
  color: var(--text-body);
  font-size: 0.94rem;
}
```

---

### 4.4 模态对话框（sandbox 安全替代 `confirm()`）

Sandbox 禁用了 `alert()` / `confirm()` / `prompt()`，使用原生 `<dialog>` 元素代替：

```html
<dialog id="confirm-modal" class="helm-modal">
  <p class="modal-message" id="modal-msg"></p>
  <div class="modal-actions">
    <button class="btn-primary" id="modal-ok">确认</button>
    <button class="btn-secondary" id="modal-cancel">取消</button>
  </div>
</dialog>
```

```css
.helm-modal {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);  /* 12px */
  padding: 24px;
  min-width: 320px;
  font-family: var(--font-sans);
}
.helm-modal::backdrop { background: rgba(0,0,0,0.60); }
.modal-message { margin-bottom: 16px; font-size: 0.94rem; line-height: 1.60; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
```

```javascript
function helmConfirm(message, onOk) {
  var modal = document.getElementById('confirm-modal')
  document.getElementById('modal-msg').textContent = message
  modal.showModal()
  document.getElementById('modal-ok').onclick = function () { modal.close(); onOk() }
  document.getElementById('modal-cancel').onclick = function () { modal.close() }
}

// 用法（完全替代 confirm()）
helmConfirm('确认删除此记录？', function () {
  // 执行删除操作
})
```

---

### 4.5 状态徽章（Badge）

```css
.badge {
  display: inline-block;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 24px;
}
.badge-active   { background: rgba(201,100,66,0.15); color: #c96442; }
.badge-inactive { background: rgba(176,174,165,0.10); color: #87867f; }
.badge-error    { background: rgba(181,51,51,0.15);  color: #b53333; }
.badge-info     { background: rgba(176,174,165,0.10); color: #b0aea5; }
```

---

### 4.6 表单输入

```css
input, select, textarea {
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);  /* 12px */
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: 1rem;
  width: 100%;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--focus);       /* Focus Blue #3898ec，系统中唯一冷色 */
  box-shadow: 0 0 0 3px rgba(56,152,236,0.15);
}
```

---

### 4.7 空状态与错误状态

```css
.empty-state {
  color: var(--text-dim);
  padding: 48px 0;
  text-align: center;
  font-size: 0.94rem;
  font-family: var(--font-sans);
  line-height: 1.60;
}

.error-state {
  color: var(--error-text);
  background: var(--error-bg);
  border-radius: var(--radius-sm);
  padding: 16px;
  font-family: var(--font-sans);
  font-size: 0.94rem;
}
```

---

## 五、间距与圆角系统

### 间距单位

基准单位为 **8px**，常用值：`4px · 8px · 12px · 16px · 20px · 24px · 32px · 48px`

- 卡片内边距：`24px`
- 页面内边距：`24px 28px`
- 组件间间距：`16px`
- 按钮内边距：`8px 16px`（平衡）或 `0px 12px 0px 8px`（图标优先）

### 圆角比例

| 大小 | 值 | 适用场景 |
|------|-----|---------|
| `--radius-sm` | `8px` | 标准按钮、卡片、徽章 |
| `--radius-md` | `12px` | 输入框、主要按钮、模态框 |
| `--radius-lg` | `16px` | 特色卡片、媒体容器 |
| `32px` | — | 英雄区容器、大型嵌入媒体 |

> 禁止在按钮或卡片上使用小于 `6px` 的圆角。

---

## 六、深度与阴影

Helm 通过**温暖环形阴影**（而非传统投影）表达层级关系：

| 层级 | 写法 | 使用场景 |
|------|------|---------|
| Flat | 无阴影 | 背景、内联文字 |
| Contained | `1px solid var(--border)` | 标准卡片边框 |
| Ring | `0px 0px 0px 1px #4d4c48` | 按钮 hover/focus、交互卡片 |
| Whisper | `rgba(0,0,0,0.05) 0px 4px 24px` | 浮起的特色卡片 |

---

## 七、完整 CSS Starter

将以下样式直接复制到插件的 `<style>` 块中作为起点：

```css
:root {
  --bg:           #141413;
  --surface:      #30302e;
  --border:       #3d3d3a;
  --text-primary: #faf9f5;
  --text-body:    #b0aea5;
  --text-muted:   #87867f;
  --text-dim:     #5e5d59;
  --brand:        #c96442;
  --brand-light:  #d97757;
  --error-text:   #b53333;
  --error-bg:     #2a1a1a;
  --focus:        #3898ec;
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    16px;
  --font-serif:   'Anthropic Serif', Georgia, serif;
  --font-sans:    'Anthropic Sans', system-ui, sans-serif;
  --font-mono:    'Anthropic Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text-body);
  padding: 24px 28px;
  line-height: 1.60;
}

h1, h2, h3 {
  font-family: var(--font-serif);
  font-weight: 500;
  color: var(--text-primary);
}
h1 { font-size: 1.6rem; line-height: 1.20; margin-bottom: 20px; }
h2 { font-size: 1.3rem; line-height: 1.20; margin-bottom: 16px; }

table { width: 100%; border-collapse: collapse; }
thead tr { border-bottom: 1px solid var(--border); }
tbody tr { border-bottom: 1px solid var(--border); }
tbody tr:last-child { border-bottom: none; }
th {
  text-align: left; padding: 8px 12px;
  color: var(--text-muted); font-size: 0.8rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.05em;
}
td { padding: 10px 12px; color: var(--text-body); font-size: 0.94rem; }

.btn-primary {
  background: var(--brand); color: var(--text-primary);
  border: none; border-radius: var(--radius-sm); padding: 8px 16px;
  font-family: var(--font-sans); font-size: 1rem; cursor: pointer;
  box-shadow: var(--brand) 0 0 0 0, var(--brand) 0 0 0 1px;
}
.btn-primary:hover { opacity: 0.90; }

.btn-secondary {
  background: var(--surface); color: var(--text-body);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 8px 16px; font-family: var(--font-sans); font-size: 1rem; cursor: pointer;
}

.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 24px;
}

.empty-state {
  color: var(--text-dim); padding: 48px 0;
  text-align: center; font-size: 0.94rem;
}

.error-state {
  color: var(--error-text); background: var(--error-bg);
  border-radius: var(--radius-sm); padding: 16px; font-size: 0.94rem;
}

dialog.helm-modal {
  background: var(--surface); color: var(--text-primary);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  padding: 24px; min-width: 320px; font-family: var(--font-sans);
}
dialog.helm-modal::backdrop { background: rgba(0,0,0,0.60); }
.modal-message { margin-bottom: 16px; font-size: 0.94rem; line-height: 1.60; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
```

---

## 八、Do's & Don'ts

### ✅ 应该

- 用 `#141413`（Deep Dark）作为深色页面背景，而非 `#000`、`#1a1a1a` 或 `#1e1e1c`
- 用 CSS 自定义属性（`:root { --bg: ... }`）集中管理所有颜色 token
- 所有灰色选用带黄褐色调的 token（`#b0aea5`、`#87867f`、`#5e5d59`）
- 所有标题使用 `font-family: var(--font-serif); font-weight: 500`
- 用 `<dialog>` 元素实现确认/提示流程（替代 sandbox 中不可用的 `confirm()`）
- 按钮、卡片交互态使用环形阴影（`box-shadow: 0px 0px 0px 1px`）
- 保持正文行高 `1.60`，营造舒适的阅读节奏
- 圆角 ≥ `8px`（`--radius-sm`）用于所有交互元素

### ❌ 禁止

- 禁用 `alert()`、`confirm()`、`prompt()`、`window.open()`（sandbox 已禁用）
- 禁止冷蓝灰（`#6b7280`、`#9ca3af`、`#718096` 等）
- 禁止用 `#ffffff` 作为深色场景背景
- 禁止将 Terracotta (`#c96442`) 用于装饰或次要元素——仅限主 CTA
- 禁止 Serif 字重超过 500（不使用 `font-weight: 700` 或 `bold`）
- 禁止 `< 6px` 的圆角出现在按钮或卡片上
- 禁止重度投影——使用环形阴影或 whisper 阴影

---

## 九、完整示例页面

结合上述规范的完整插件起始页：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>我的插件</title>
  <script src="/plugin-sdk/helm-sdk.js"></script>
  <style>
    :root {
      --bg: #141413; --surface: #30302e; --border: #3d3d3a;
      --text-primary: #faf9f5; --text-body: #b0aea5;
      --text-muted: #87867f; --text-dim: #5e5d59;
      --brand: #c96442; --error-text: #b53333; --error-bg: #2a1a1a;
      --radius-sm: 8px; --radius-md: 12px;
      --font-serif: 'Anthropic Serif', Georgia, serif;
      --font-sans: 'Anthropic Sans', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-sans); background: var(--bg); color: var(--text-body); padding: 24px 28px; line-height: 1.60; }
    h1 { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 500; color: var(--text-primary); margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr, tbody tr { border-bottom: 1px solid var(--border); }
    tbody tr:last-child { border-bottom: none; }
    th { text-align: left; padding: 8px 12px; color: var(--text-muted); font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 10px 12px; font-size: 0.94rem; }
    .empty-state { color: var(--text-dim); padding: 48px 0; text-align: center; }
    .error-state { color: var(--error-text); background: var(--error-bg); border-radius: var(--radius-sm); padding: 16px; }
    .btn-primary { background: var(--brand); color: var(--text-primary); border: none; border-radius: var(--radius-sm); padding: 8px 16px; font-size: 1rem; cursor: pointer; box-shadow: var(--brand) 0 0 0 0, var(--brand) 0 0 0 1px; }
    dialog.helm-modal { background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; min-width: 320px; }
    dialog.helm-modal::backdrop { background: rgba(0,0,0,0.60); }
    .modal-message { margin-bottom: 16px; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-secondary { background: var(--surface); color: var(--text-body); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>我的插件</h1>
  <div id="root"><p class="empty-state">正在加载…</p></div>

  <dialog id="confirm-modal" class="helm-modal">
    <p class="modal-message" id="modal-msg"></p>
    <div class="modal-actions">
      <button class="btn-primary" id="modal-ok">确认</button>
      <button class="btn-secondary" id="modal-cancel">取消</button>
    </div>
  </dialog>

  <script>
    function helmConfirm(message, onOk) {
      var modal = document.getElementById('confirm-modal')
      document.getElementById('modal-msg').textContent = message
      modal.showModal()
      document.getElementById('modal-ok').onclick = function () { modal.close(); onOk() }
      document.getElementById('modal-cancel').onclick = function () { modal.close() }
    }

    HelmSDK.init(function (ctx) {
      fetch(ctx.apiBase + '/api/v1/plugins/my-plugin/records', {
        headers: { Authorization: 'Bearer ' + HelmSDK.getToken() }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        })
        .then(function (data) {
          var items = Array.isArray(data) ? data : (data.items || [])
          if (!items.length) {
            document.getElementById('root').innerHTML = '<p class="empty-state">暂无数据</p>'
            return
          }
          var keys = Object.keys(items[0])
          var html = '<table><thead><tr>'
          keys.forEach(function (k) { html += '<th>' + k + '</th>' })
          html += '</tr></thead><tbody>'
          items.forEach(function (row) {
            html += '<tr>'
            keys.forEach(function (k) { html += '<td>' + (row[k] ?? '') + '</td>' })
            html += '</tr>'
          })
          document.getElementById('root').innerHTML = html + '</tbody></table>'
        })
        .catch(function (err) {
          document.getElementById('root').innerHTML =
            '<div class="error-state">加载失败：' + err.message + '</div>'
        })
    })
  </script>
</body>
</html>
```

---

## 相关文档

- [11. iframe 前端](11-iframe-frontend.md) — SDK API、sandbox 约束、Vite 构建工作流
- `Markdown/DESIGN.md` — 设计系统完整参考（颜色、字体、组件、布局的权威来源）
