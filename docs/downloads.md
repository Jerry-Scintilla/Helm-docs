# 下载

## Helm Plugin Dev — Claude Code Skill

`helm-plugin-dev` 是一个 **Claude Code Skill**，能够帮助你在 Helm 项目中一键生成完整的插件骨架代码。

### 功能

- 通过交互式问答收集插件需求
- 自动生成所有必要文件：`pyproject.toml`、`plugin.py`、路由、任务、迁移、前端
- 提供可直接运行的本地测试命令
- 内置质量检查清单

### 安装方式

Skill 需要安装到你的 **Helm 项目目录**下（`C:\Users\jerry\PycharmProjects\Helm` 或你的 Helm 仓库根目录），而不是全局 Claude 配置目录。

**第 1 步：在 Helm 项目根目录创建目录结构**

```
your-helm-project/
└── .claude/
    └── skills/
        └── helm-plugin-dev/
            ├── SKILL.md
            ├── references/
            │   └── api.md
            └── evals/
                └── evals.json
```

**第 2 步：下载文件**

下载以下三个文件，放入对应目录：

| 文件 | 下载链接 | 放置路径 |
|------|---------|---------|
| `SKILL.md` | [下载](downloads/helm-plugin-dev/SKILL.md) | `.claude/skills/helm-plugin-dev/SKILL.md` |
| `api.md` | [下载](downloads/helm-plugin-dev/references/api.md) | `.claude/skills/helm-plugin-dev/references/api.md` |
| `evals.json` | [下载](downloads/helm-plugin-dev/evals/evals.json) | `.claude/skills/helm-plugin-dev/evals/evals.json` |

**第 3 步：在 Claude Code 中使用**

打开 Helm 项目目录中的 Claude Code（VSCode 扩展或 CLI），输入：

```
/helm-plugin-dev
```

或直接描述你的需求，Claude Code 会自动识别并触发 Skill：

> "帮我创建一个 Helm 插件，用来追踪军团的 PAP 活跃度记录"

### 使用示例

Skill 会先进行问答：

```
1. 插件名称（URL slug）：pap-tracker
2. 功能描述：追踪军团成员 PAP 活跃度，记录参战次数
3. 需要的能力：REST API、Celery 任务、数据库表、侧边栏菜单
4. 作者名：Jerry
```

然后生成完整的插件包，包含：
- `pyproject.toml`（含正确的 entry point）
- `pap_tracker/plugin.py`
- `pap_tracker/routers.py`
- `pap_tracker/tasks.py`
- `pap_tracker/models.py`
- `migrations/versions/0001_initial.py`
- 本地测试步骤（`pip install -e` + `curl` 命令）

### 版本信息

| 字段 | 值 |
|------|-----|
| Skill 版本 | 1.0.0 |
| 兼容 Helm SDK | `>=1.0,<2.0` |
| 适用 Helm 版本 | Phase 3+ |

---

## 插件开发指南（在线阅读）

完整的插件开发文档可直接在本站阅读：[插件开发指南](plugin-dev/index.md)

涵盖 17 个章节，包括：概念速览、最小插件示例、HelmPlugin API 参考、lifecycle 钩子、数据库迁移、ExtensionRegistry、角色页面扩展等。
