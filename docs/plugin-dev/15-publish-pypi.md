# 15. 发布与上架插件市场

---

## 发布到 PyPI

### 前置准备

```bash
pip install build twine
```

确保 `pyproject.toml` 中包名遵循命名规范：`helm-plugin-{功能名}`，例如 `helm-plugin-fleet-tracker`。

### 构建与上传

```bash
# 构建 wheel 和 sdist
python -m build

# 上传到 PyPI（正式发布）
twine upload dist/*

# 上传到 TestPyPI（测试/预发布）
twine upload --repository testpypi dist/*
```

### 验证安装

```bash
# 从 PyPI 验证
pip install helm-plugin-fleet-tracker

# 从 TestPyPI 验证
pip install --index-url https://test.pypi.org/simple/ helm-plugin-fleet-tracker
```

---

## 上架 Helm 插件市场

Helm 插件市场通过 GitHub 策划索引（[helm-plugin-index](https://github.com/Jerry-Scintilla/helm-plugin-index)）驱动。发布到 PyPI 后，向该仓库提交 PR 即可让插件出现在所有 Helm 实例的市场界面中。

### index.json 字段说明

索引文件为 JSON 数组，每个插件为一个对象：

```json
{
  "package_name": "helm-plugin-fleet-tracker",
  "display_name": "Fleet Tracker",
  "description": "实时追踪联盟舰队动态，支持路径回放和活跃度分析。",
  "author": "YourName",
  "version": "0.1.0",
  "homepage": "https://github.com/your-org/helm-plugin-fleet-tracker",
  "source": "pypi",
  "tags": ["fleet", "tracking", "analytics"],
  "verified": false
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `package_name` | ✅ | PyPI 包名，用于执行 `pip install` |
| `display_name` | ✅ | 市场界面中显示的友好名称 |
| `description` | — | 插件功能简介（省略时自动从 PyPI/TestPyPI 拉取） |
| `author` | — | 作者名（省略时自动从注册源拉取） |
| `version` | — | 当前版本（省略时自动从注册源拉取） |
| `homepage` | — | 源码或文档链接 |
| `source` | — | `"pypi"`（默认）或 `"testpypi"` |
| `tags` | — | 分类标签，用于市场搜索过滤 |
| `verified` | — | 是否通过官方验证（默认 `false`，见下文） |

!!! tip "自动补全"
    `version`、`author`、`description` 省略后，Helm 在刷新市场索引时会自动从对应注册源（PyPI 或 TestPyPI）查询补全，无需手动维护。

### 提交 PR 步骤

1. Fork [helm-plugin-index](https://github.com/Jerry-Scintilla/helm-plugin-index) 仓库
2. 在 `index.json` 末尾追加你的插件条目
3. 提交 PR，标题格式：`add: helm-plugin-{功能名}`
4. PR 合并后，所有 Helm 实例在下一次缓存刷新（最多 6 小时）后即可在市场界面看到你的插件

### `source` 字段选择

| 场景 | 推荐值 |
|------|--------|
| 正式发布，已通过 PyPI 审核 | `"pypi"` |
| 测试版/内测，发布于 TestPyPI | `"testpypi"` |

!!! warning "TestPyPI 注意事项"
    TestPyPI 上的包随时可能被清理，建议仅用于开发阶段验证。正式插件应发布到 PyPI。

---

## `verified` 验证状态

`verified: true` 表示该插件经过 Helm 项目维护者的代码审查和安全确认。

**申请流程：**

1. 确保插件已在 PyPI 正式发布，且版本稳定
2. 在 `index.json` PR 或单独 Issue 中附上源码仓库链接，并说明主要功能
3. 维护者审查通过后，将 `verified` 置为 `true` 并合并

未经验证的插件（`verified: false`）仍可正常安装，市场界面会以视觉标记区分两者。
