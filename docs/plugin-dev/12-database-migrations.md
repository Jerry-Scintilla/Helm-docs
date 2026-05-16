# 12. 插件自有数据库迁移

插件的迁移通过**独立子进程**（`app.plugins._migration_runner`）执行，每个插件拥有独立的版本追踪表 `alembic_version_<plugin_name>`，与主服务的 `alembic_version` 表完全隔离，插件之间也互不干扰。

---

## 目录结构

```
my_plugin/
└── migrations/
    └── versions/
        ├── 0001_initial.py
        └── 0002_add_column.py
```

`migrations/alembic.ini` 和 `migrations/env.py` **不由安装器使用**，可作为本地命令行辅助保留（见下文），也可不提供。

---

## 迁移文件规范

### 首个迁移

```python
# my_plugin/migrations/versions/0001_initial.py

from alembic import op
import sqlalchemy as sa

revision = "0001my_plugin"
down_revision = None       # 必须为 None —— 独立根节点
branch_labels = None       # 无需设置，安装器通过独立版本表隔离各插件
depends_on = None


def upgrade() -> None:
    op.create_table(
        "my_plugin_records",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("character_id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        if_not_exists=True,                 # ← 必须加，保证重装幂等
    )
    op.create_index(
        "ix_my_plugin_records_character_id",
        "my_plugin_records", ["character_id"],
        if_not_exists=True,                 # ← 同上
    )


def downgrade() -> None:
    op.drop_table("my_plugin_records")
```

!!! warning "必须使用 `if_not_exists=True`"
    `op.create_table` 和所有 `op.create_index` 调用都**必须**带 `if_not_exists=True`。

    **原因：** 若数据库中已存在同名表（如旧版安装残留），而插件版本追踪表 `alembic_version_<name>` 不存在或已被清除，alembic 会认为需要从头执行迁移，导致 `DuplicateTable` 错误，使每次重装必然失败。`if_not_exists=True` 使迁移幂等，跳过已存在的对象而不报错。

### 使用 PostgreSQL 枚举类型

若需要自定义枚举类型，必须**手动创建 + `create_type=False`** 的组合，避免 SQLAlchemy 的 `before_create` 事件再次发出 `CREATE TYPE`：

```python
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

def upgrade() -> None:
    op.execute("CREATE TYPE my_plugin_status AS ENUM ('pending', 'done', 'failed')")

    op.create_table(
        "my_plugin_jobs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "status",
            PgEnum("pending", "done", "failed",
                   name="my_plugin_status",
                   create_type=False),   # ← 必须 False，类型已在上方手动创建
            nullable=False,
            server_default="pending",
        ),
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_table("my_plugin_jobs")
    op.execute("DROP TYPE IF EXISTS my_plugin_status")   # ← downgrade 中也必须显式清理
```

### 后续迁移

```python
revision = "0002my_plugin"
down_revision = "0001my_plugin"   # 指向本插件上一个 revision
branch_labels = None
depends_on = None
```

### 关键约束汇总

| 字段 | 要求 |
|------|------|
| `branch_labels` | 始终为 `None`（安装器通过独立版本表区分插件，无需 alembic 分支机制） |
| `down_revision` | 首个迁移必须为 `None` |
| `if_not_exists` | `create_table` / `create_index` 均必须带此参数 |
| 表名 | 建议加插件前缀（如 `my_plugin_`），避免命名冲突 |
| `downgrade()` | 必须实现；若手动创建了 PostgreSQL 类型，必须在 downgrade 中显式 `DROP TYPE IF EXISTS` |

---

## models.py（独立 Base）

插件模型必须使用独立的 `Base`，**不能**继承主服务的 `app.core.database.Base`：

```python
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class MyPluginRecord(Base):
    __tablename__ = "my_plugin_records"
    # ...
```

---

## pyproject.toml 打包配置

只需将 `versions/` 目录打包进 wheel：

```toml
[tool.setuptools.package-data]
my_plugin = [
    "migrations/versions/*.py",
    # 以下两行仅在保留本地开发辅助文件时才需要
    # "migrations/alembic.ini",
    # "migrations/env.py",
]
```

---

## 生命周期

| 时机 | 执行内容 |
|------|----------|
| 安装插件 | 子进程运行 `upgrade → head`，创建插件所有表，版本记录写入 `alembic_version_<name>` |
| 卸载插件 | 子进程运行 `downgrade → base`，删除插件所有表（在 pip uninstall 之前执行） |
| 重装插件 | 若版本表已存在且已在 head，alembic 跳过；若不同步则幂等地补全 |

!!! info "迁移隔离机制"
    安装器为每个插件启动独立的 Python 子进程，使用同步 `psycopg2` 驱动直连数据库，完全绕过主服务的 asyncio 事件循环和 asyncpg 连接池。插件间共享同一个 PostgreSQL 数据库，但通过独立的版本追踪表（`alembic_version_<plugin_name>`）互不干扰。

---

## 本地开发辅助（可选）

如需在本地使用 `alembic revision --autogenerate` 生成新迁移，可在 `migrations/` 下保留独立的 `alembic.ini` 和 `env.py`，**仅用于本地命令行操作**，安装器不会使用它们。

**migrations/alembic.ini**（示例）：

```ini
[alembic]
script_location = %(here)s
```

**migrations/env.py**（示例）：

```python
import os, sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend"))

from app.core.config import settings
from my_plugin.models import Base

PLUGIN_NAME = "my-plugin"
VERSION_TABLE = f"alembic_version_{PLUGIN_NAME.replace('-', '_')}"

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_online() -> None:
    # 子进程使用同步 psycopg2，env.py 保持一致
    url = settings.db_url.replace("+asyncpg", "")
    engine = create_engine(url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_table=VERSION_TABLE,
        )
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


run_migrations_online()
```

> **注意**：生成迁移后，将新文件复制到插件的 `migrations/versions/` 目录即可，`alembic.ini` 和 `env.py` 本身不需要随 wheel 分发。
