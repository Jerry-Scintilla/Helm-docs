# 插件市场

Helm 内置插件市场，提供可浏览、可搜索的官方插件目录，支持直接从 PyPI 或 TestPyPI 一键安装。

---

## 插件市场界面

进入 **管理后台 → 插件管理 → 插件市场** 标签页即可访问市场。

**工作流程：**

1. 系统从 GitHub 上的策划索引（`marketplace_index_url`）拉取插件列表
2. 对缺少版本/作者/描述的条目，自动从对应注册源（PyPI 或 TestPyPI）补全元数据
3. 索引结果缓存于 Redis，默认 **6 小时**逻辑过期（过期后立即返回旧数据，后台异步刷新）
4. 管理员可点击 **刷新市场** 按钮强制重建索引

**功能一览：**

| 功能 | 说明 |
|------|------|
| 搜索 | 按包名、显示名称、描述、标签模糊搜索 |
| 来源标识 | 每个插件显示来源（PyPI / TestPyPI）及验证状态 |
| 安装状态 | 已安装的插件会标记，避免重复安装 |
| 一键安装 | 点击安装按钮直接从对应来源拉包 |

**API 接口：**

```bash
# 搜索插件市场（支持 q 查询参数）
curl "http://your-helm/api/v1/admin/plugins/marketplace/search?q=fleet" \
  -H "Authorization: Bearer <admin-token>"

# 强制刷新市场索引缓存
curl -X POST http://your-helm/api/v1/admin/plugins/marketplace/refresh \
  -H "Authorization: Bearer <admin-token>"
```

---

## 安装方式快速参考

在管理后台 → **插件管理** 中，可通过市场界面浏览安装，也可直接输入包名安装。

```bash
# 从 PyPI 安装（默认）
curl -X POST http://your-helm/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "<包名>", "source": "pypi"}'

# 从 TestPyPI 安装
curl -X POST http://your-helm/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "<包名>", "source": "testpypi"}'
```

详细操作步骤参见 [插件管理](plugins.md#安装插件)。

---

## 已注册插件

以下列表实时从 [helm-plugin-index](https://github.com/Jerry-Scintilla/helm-plugin-index) 拉取，页面加载时自动更新，无需重新构建文档。

<div id="helm-marketplace"></div>

---

!!! tip "开发自己的插件？"
    参阅 [插件开发指南](../plugin-dev/index.md) 了解如何构建和发布插件，以及如何将插件提交到市场索引。下载 [AI 脚手架 Skill](../downloads.md) 可使用 Claude Code 一键生成插件骨架。
