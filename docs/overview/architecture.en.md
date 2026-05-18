# System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser / Client                        │
│                                                             │
│  ┌──────────────────────┐    ┌────────────────────────────┐ │
│  │    Vue 3 SPA Main UI  │    │   Plugin iframe Pages      │ │
│  │  (Naive UI / Pinia)  │◄──►│  (Any frontend tech stack) │ │
│  │                      │    │  HelmSDK postMessage        │ │
│  └──────────┬───────────┘    └────────────────────────────┘ │
└─────────────┼───────────────────────────────────────────────┘
              │ HTTP / REST (JWT Bearer)
              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                         │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Core Routes  │  │ Plugin Routes│  │  Static Files     │  │
│  │ /auth       │  │ (hot-mounted)│  │ /plugin-ui/{name} │  │
│  │ /characters │  │ /api/v1/     │  │ /plugin-sdk/      │  │
│  │ /corps      │  │ plugins/{n}/ │  │  helm-sdk.js       │  │
│  │ /admin      │  └──────────────┘  └───────────────────┘  │
│  └─────────────┘                                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Plugin Manager                      │   │
│  │  PluginManager · ExtensionRegistry · PluginInstaller  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬────────────────────────────────────┬─────────────┘
           │ SQLAlchemy (asyncpg)               │ Celery
           ▼                                   ▼
┌─────────────────────┐           ┌────────────────────────┐
│     PostgreSQL      │           │   Celery Worker        │
│                     │           │                        │
│  · Users / Characters│          │  · ESI data fetch tasks│
│  · Corps / Alliances│           │  · Custom plugin tasks │
│  · Permissions /    │           │  · Task run history    │
│    Plugins          │           │                        │
│  · ESI cached data  │           │  ┌──────────────────┐  │
│  · Plugin tables    │           │  │  Redis (Broker)   │  │
└─────────────────────┘           │  └──────────────────┘  │
                                  └───────────┬────────────┘
                                              │ httpx
                                              ▼
                                  ┌────────────────────────┐
                                  │  EVE ESI API (CCP)     │
                                  │  esi.evetech.net        │
                                  └────────────────────────┘
```

## Component Details

### FastAPI Backend (`backend/`)

The backend is fully async, built on FastAPI 0.136+ and SQLAlchemy 2.0 asyncio mode.

| Module | Path | Responsibility |
|--------|------|----------------|
| Core config | `app/core/` | DB connection, auth, config loading |
| ORM models | `app/models/` | All database table definitions |
| Routers | `app/routers/` | REST API endpoints |
| Permissions | `app/core/permissions.py` | RBAC dependency injection |
| Plugin manager | `app/plugins/manager.py` | Plugin loading, hot-mounting, lifecycle |
| Plugin installer | `app/plugins/installer.py` | pip install / whl upload |
| Extension registry | `app/plugins/registry.py` | Plugin-to-plugin communication |
| ESI layer | `app/esi/` | ESI client, cache, rate limiting |
| Background tasks | `app/tasks/` | Celery task definitions |

### Vue 3 Frontend (`frontend/`)

A single-page application (SPA) that calls the Helm REST API via axios and manages state with Pinia.

| Module | Path | Responsibility |
|--------|------|----------------|
| Views | `src/views/` | Page components (Dashboard, Characters, Corps, Admin) |
| Router | `src/router/` | Vue Router configuration |
| State | `src/stores/` | Pinia stores (auth, characters, UI) |
| API client | `src/api/` | axios wrapper for backend communication |
| Components | `src/components/` | Reusable UI components |

### Plugin System

```
Python wheel package (helm-plugin-xxx)
│
├── pyproject.toml          → entry_points["helm.plugins"]
├── {pkg}/plugin.py         → Plugin class inheriting HelmPlugin
├── {pkg}/routers.py        → FastAPI APIRouter (optional)
├── {pkg}/tasks.py          → Celery tasks (optional)
├── {pkg}/models.py         → SQLAlchemy models (optional)
├── {pkg}/frontend/dist/    → Compiled frontend (optional)
└── migrations/             → Alembic migration scripts (optional)
```

Once a plugin is enabled, `PluginManager` dynamically mounts its `APIRouter` under `/api/v1/plugins/{name}/` — **no service restart required**.

### Plugin Frontend (HelmSDK)

```
Helm main UI
│
└── <iframe src="/plugin-ui/{name}/index.html"
          sandbox="allow-scripts allow-same-origin allow-forms">
      │
      └── <script src="/plugin-sdk/helm-sdk.js">
            ↕ postMessage protocol
          HelmSDK.init(ctx => {
            ctx.token   → JWT Bearer Token
            ctx.apiBase → "http://your-helm-instance"
          })
```

### ESI Data Flow

```
Celery Worker (scheduled trigger)
    │
    ▼
ESI Bucket — grouped by character_id
    │
    ├─→ httpx → esi.evetech.net
    │              │
    │              ▼
    │         Logical expiry cache layer (background refresh)
    │              │
    └─────────────►▼
              PostgreSQL (ESI data tables)
                   │
                   ▼
              FastAPI Routes → Frontend display
```

## Data Model Relationships

```
User ──1:N──► Character ──N:1──► Corporation ──N:1──► Alliance
                  │
                  ├──► Wallet / Mail / Assets / Skills / Notifications
                  │
                  └──► APIToken (programmatic access token)

Plugin
  ├── name, version, author
  ├── status (enabled / disabled)
  └── router_mounted (bool)

Permission
  ├── name ("plugin-name.action")
  ├── scope_type (global / character / corporation / alliance)
  └── plugin_name (owning plugin)

Bucket ──1:N──► Character (ESI refresh batch grouping)

TaskRun
  ├── task_name
  ├── started_at / finished_at
  └── status / result
```

## Deployment Topology

```
                    ┌─────────────┐
                    │  Nginx /    │
                    │  Caddy      │  (optional reverse proxy)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌────────────┐   ┌────────────┐
    │ Uvicorn  │    │  Vite      │   │  Celery    │
    │ FastAPI  │    │  Build     │   │  Worker    │
    │ :8000    │    │  (static)  │   │            │
    └──────────┘    └────────────┘   └────────────┘
          │                                │
          └──────────────┬─────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PostgreSQL│   │  Redis   │   │  ESI API │
    │  :5432   │   │  :6379   │   │ (external│
    └──────────┘   └──────────┘   └──────────┘
```
