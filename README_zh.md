# Helm 文档

本仓库是 **Helm** 官方文档站点，Helm 是一个开源的 EVE Online 军团管理平台，采用插件化架构。

如需了解 Helm 项目本身（包括源码、安装、插件开发等），请访问：https://github.com/Jerry-Scintilla/Helm

## 文档网站

在线文档已部署至：https://jerry-scintilla.github.io/Helm-docs/

## 项目结构

```
docs/
├── index.md               # 首页
├── overview/              # 产品概述、功能特性、架构说明
├── getting-started/       # 安装与配置指南
├── user-guide/            # 用户指南
├── admin-guide/           # 管理员指南
├── plugin-dev/            # 插件开发指南（17 章）
├── api-reference/         # 核心 API 参考
├── downloads/             # 下载资源（Claude Code skill）
└── stylesheets/           # 自定义 CSS（暖色设计系统）
```

## 本地开发

```bash
pip install -r requirements.txt
mkdocs serve
# → http://localhost:8000
```

## 构建与部署

推送至 `main` 分支 — GitHub Actions 将自动构建并部署至 GitHub Pages。

```bash
# 手动构建
mkdocs build

# 手动部署（需已配置 GitHub Pages）
mkdocs gh-deploy
```

## 参与贡献

1. 编辑 `docs/` 下的 Markdown 文件
2. 运行 `mkdocs serve` 预览效果
3. 提交 Pull Request

## 安全

如果你发现 Helm 存在安全漏洞，请发送邮件至 **jerrycaocao@126.com**，而不是在 GitHub 上公开提交 Issue。

## 许可证

文档内容采用 GPL-3.0 许可证（见 [LICENSE](LICENSE)）。
Helm 源码许可证：https://github.com/Jerry-Scintilla/Helm