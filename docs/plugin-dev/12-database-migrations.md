# 12. 插件自有数据库迁移

插件的迁移通过**主服务 alembic 上下文**统一执行，与主服务共用同一张 `alembic_version` 表。安装插件时，服务端调用 `alembic.command.upgrade` Python API，在进程内升级插件的迁移分支，不再启动子进程。

---

## 目录结构

```
fleet_tracker/
└── migrations/
    └── versions/
        ├── 0001_initial.py
        └── 0002_add_column.py
```

`migrations/alembic.ini` 和 `migrations/env.py` **不再由安装器使用**，可作为本地开发辅助保留（见下文），也可不提供。

---

## 迁移文件规范

### 首个迁移（独立根节点）

```python
# fleet_tracker/migrations/versions/0001_initial.py

revision = "0001fleet_tracker"
down_revision = None                        # 必须为 None —— 独立根节点
branch_labels = ("fleet-tracker",)          # 必须与 HelmPlugin.name 一致
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.create_table(
        "fleet_tracker_records",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("character_id", sa.BigInteger, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("fleet_tracker_records")
```

### 后续迁移

```python
revision = "0002fleet_tracker"
down_revision = "0001fleet_tracker"         # 指向本插件上一个 revision
branch_labels = None                        # 仅首个迁移设置 branch_labels
depends_on = None
```

### 关键约束

| 字段 | 要求 |
|------|------|
| `branch_labels` | 仅首个迁移设置，值必须为 `(HelmPlugin.name,)` 的元组 |
| `down_revision` | 首个迁移必须为 `None`（与主服务分支独立） |
| 表名 | 建议加插件前缀（如 `fleet_tracker_`），避免命名冲突 |
| `downgrade()` | 必须实现，卸载插件时服务端会自动执行 |

---

## models.py（仍需独立 Base）

插件模型必须使用独立的 `Base`，**不能**继承主服务的 `app.core.database.Base`：

```python
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class FleetRecord(Base):
    __tablename__ = "fleet_tracker_records"
    ...
```

---

## pyproject.toml 打包配置

只需将 `versions/` 目录打包进 wheel，`alembic.ini` / `env.py` 按需包含：

```toml
[tool.setuptools.package-data]
fleet_tracker = [
    "migrations/versions/*.py",
    # 以下两行仅在保留本地开发辅助文件时才需要
    # "migrations/alembic.ini",
    # "migrations/env.py",
]
```

---

## 生命周期

| 时机 | 操作 | 说明 |
|------|------|------|
| 安装插件 | `alembic upgrade fleet-tracker@head` | 创建插件所有表 |
| 卸载插件 | `alembic downgrade fleet-tracker@base` | 删除插件所有表（在 pip remove 之前执行） |
| 主服务 `alembic upgrade head` | 自动包含所有已安装插件的迁移 | 主服务 `env.py` 动态发现 |

---

## 本地开发辅助（可选）

如需在本地使用 `alembic revision --autogenerate` 生成新迁移，可在 `migrations/` 下保留独立的 `alembic.ini` 和 `env.py`，**仅用于本地命令行操作**，安装器不会使用它们。

**migrations/alembic.ini**（示例）：

```ini
[alembic]
script_location = %(here)s
sqlalchemy.url = postgresql+asyncpg://helm:helm@127.0.0.1:5432/helm
```

**migrations/env.py**（示例）：

```python
import asyncio, os, sys
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy.engine import Connection
from alembic import context

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend"))

from fleet_tracker.models import Base  # 插件自己的 Base

config = context.config
target_metadata = Base.metadata


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


run_migrations_online()
```

> **注意**：生成迁移后，将新文件复制到插件的 `migrations/versions/` 目录即可；`alembic.ini` 和 `env.py` 本身不需要随 wheel 分发。
