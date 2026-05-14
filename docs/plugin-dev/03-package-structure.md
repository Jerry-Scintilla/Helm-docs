# 3. 包结构与 Entry Point

## 推荐目录结构

**无前端插件（仅后端 API）：**

```
helm-plugin-hello/
├── pyproject.toml
└── hello_helm/
    ├── __init__.py
    ├── plugin.py          # 包含 HelmPlugin 子类
    ├── routers.py         # （可选）APIRouter 定义
    ├── models.py          # （可选）SQLAlchemy 模型
    ├── tasks.py           # （可选）Celery 任务
    └── migrations/        # （可选）插件自有迁移
        └── versions/      # 迁移文件；alembic.ini/env.py 仅本地开发辅助
```

**含 iframe 前端插件：**

```
helm-plugin-hello/
├── pyproject.toml
└── hello_helm/
    ├── __init__.py
    ├── plugin.py
    ├── routers.py
    ├── frontend/
    │   ├── dist/          # 编译输出，随 wheel 分发
    │   │   ├── index.html
    │   │   └── assets/
    │   ├── src/           # 源码（不打包进 wheel）
    │   ├── package.json
    │   └── vite.config.ts
    └── migrations/
        └── versions/      # 迁移文件；alembic.ini/env.py 仅本地开发辅助
```

## pyproject.toml

**无前端：**

```toml
[project]
name = "helm-plugin-hello"
version = "0.1.0"
description = "A Helm plugin example"
requires-python = ">=3.12"
dependencies = []   # fastapi/sqlalchemy 等已在服务端 virtualenv 中

[project.entry-points."helm.plugins"]
hello = "hello_helm.plugin:HelloPlugin"

[tool.setuptools.packages.find]
where = ["."]
```

**含前端（额外添加 package-data）：**

```toml
[project]
name = "helm-plugin-hello"
version = "0.1.0"
description = "A Helm plugin example"
requires-python = ">=3.12"
dependencies = []

[project.entry-points."helm.plugins"]
hello = "hello_helm.plugin:HelloPlugin"

[tool.setuptools.packages.find]
where = ["."]

[tool.setuptools.package-data]
hello_helm = [
    "frontend/dist/**",
    "migrations/versions/*.py",
    # migrations/alembic.ini 和 migrations/env.py 仅本地开发辅助，无需打包
]
```

> **注意**：发布 wheel 前必须先构建前端（`npm run build`），否则 `dist/` 为空。

## 安装方式

```bash
# 从 PyPI 安装
POST /api/v1/admin/plugins/install
{"package_name": "helm-plugin-hello"}

# 上传 .whl 安装
POST /api/v1/admin/plugins/install/upload
（multipart/form-data，字段名 file）

# 本地开发安装（editable）
pip install -e ./helm-plugin-hello
POST /api/v1/admin/plugins/install
{"package_name": "helm-plugin-hello"}
```
