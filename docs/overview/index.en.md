# What is Helm

Helm is an **open-source fleet management and administrative platform** for EVE Online corporations and alliances. It syncs game data in real time via CCP's official EVE Swagger Interface (ESI) API, provides administrators and members with a unified web interface, and supports unlimited feature extensions through its plugin system.

## Design Goals

| Goal | Description |
|------|-------------|
| **Open extensibility** | The plugin system allows any developer to add custom features for specific corporation scenarios without modifying core code |
| **Minimal ops overhead** | Hot-reload plugins, async ESI refresh, and automatic database migrations minimize manual administrator intervention |
| **Fine-grained permissions** | Four-dimensional RBAC ensures different roles can only see and act on data within their permission scope |
| **Real-time data** | The ESI cache layer supports logical expiration and background refresh, keeping game data as current as possible |

## Core Capabilities

### Identity & Authentication
- EVE Online SSO (OAuth 2.0) single sign-on, supports multiple character bindings
- JWT session tokens + long-lived API Tokens (for programmatic access)
- Fine-grained RBAC permission control

### Data Sync
- Characters: skills, assets, wallet, mail, notifications, contacts
- Corporations: member list, assets, finances, corp mail
- Alliances: member corporations, alliance overview
- ESI bucket-based rate limiting to prevent API bans

### Plugin System
- Python wheel-based packages, installable from PyPI or local `.whl` files
- Plugins can register FastAPI routes (hot-mounted, no restart required)
- Plugins can register Celery background tasks (effective after soft worker restart)
- Plugins can declare permissions, ESI scopes, and sidebar menu items
- Plugins can provide iframe frontend pages (any tech stack)
- Plugin-to-plugin communication via `ExtensionRegistry`

### Admin Panel
- Plugin install / enable / disable / uninstall
- Task run history
- User permission management

## Use Cases

=== "Corporation Admins"
    - Unified view of all member characters' skills, assets, and wallet status
    - Install custom plugins (e.g., PAP activity tracking, fleet scheduling, killboard stats)
    - Manage member permissions, distinguishing officers, regular members, and guests

=== "Fleet Members"
    - One-click login via EVE SSO — no separate account registration needed
    - View your character's info, assets, and wallet details
    - Receive corporation notifications

=== "Plugin Developers"
    - Use the plugin system to build custom features for your corporation
    - Use `ExtensionRegistry` to communicate with other plugins
    - Build iframe frontend pages using HelmSDK

=== "API Integrators"
    - Use API Tokens to query Helm data via REST API
    - Integrate with external tools (Discord bots, external dashboards, etc.)

## Comparison with Similar Tools

Helm targets a similar niche as [SeAT](https://seat.docs.eve-tools.xyz/). Key differences:

| Feature | Helm | SeAT |
|---------|------|------|
| Tech Stack | FastAPI + Vue 3 (Python / TS) | Laravel (PHP) |
| Plugin System | Native hot-reload, no restart | Requires reload |
| Frontend Architecture | Vue 3 SPA + plugin iframes | Blade templates |
| Async Support | Full asyncio | Primarily sync |
| License | GPL-2.0 | MIT / GPL |

## Next Steps

- [System Architecture](architecture.md) — Understand how Helm's components relate
- [Features](features.md) — Full feature list
- [Installation](../getting-started/index.md) — Start deploying your Helm instance
