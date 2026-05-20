# Plugin Marketplace

The following official Helm plugins are available and can be installed directly via their PyPI package names. All plugins follow the Helm plugin protocol, support hot-loading, and require no service restart.

---

## Quick Install Reference

In the Admin Panel → **Plugin Management** → **Install Plugin**, enter the PyPI package name to install with one click.

```bash
# You can also install via API
curl -X POST http://your-helm/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "<package-name>"}'
```

For detailed steps, see [Plugin Management](plugins.md#install-plugin).

---

## Official Plugins

### ⚔️ Fleet Action — Fleet Operations Management

| Field | Value |
|-------|-------|
| **PyPI Package** | `helm-plugin-fleet-action` |
| **Version** | `0.1.1` |
| **Author** | Jerry_Scintilla |
| **Source** | [github.com/Jerry-Scintilla/helm-plugin-fleet-action](https://github.com/Jerry-Scintilla/helm-plugin-fleet-action) |
| **Dependencies** | None (optional integration: helm-plugin-mcp) |

**Overview**

The Fleet Action plugin manages EVE Online alliance combat attendance records, with PAP (Participation Points) distribution as its core feature.

- **Fleet Action Management**: Create/end fleet operations, recording FC, fleet ID, and operation description
- **PAP Distribution**: Reads live fleet member list via ESI and issues attendance points to all members in one click
- **MOTD Update**: Automatically updates the fleet Message of the Day after PAP issuance
- **Attendance Statistics**: Displays personal PAP records on character profile pages, aggregated by month/year/total
- **MCP Tool Integration**: When helm-plugin-mcp is also installed, AI agents can query and create fleet actions via MCP

**Permissions**

| Permission | Description |
|------------|-------------|
| `fleet-action.read` | View fleet action list and PAP records |
| `fleet-action.manage` | Create/end fleet actions |
| `fleet-action.pap` | Issue PAP to current fleet members and update MOTD |

**Required ESI Scopes**

- `esi-fleets.read_fleet.v1`
- `esi-fleets.write_fleet.v1`

---

### 🤖 MCP Bridge — Large Language Model Integration

| Field | Value |
|-------|-------|
| **PyPI Package** | `helm-plugin-mcp` |
| **Version** | `0.1.2` |
| **Author** | Jerry_Scintilla |
| **Source** | [github.com/Jerry-Scintilla/helm-plugin-MCP](https://github.com/Jerry-Scintilla/helm-plugin-MCP) |
| **Dependencies** | None (other plugins can register tools to extend MCP capabilities) |

**Overview**

The MCP Bridge plugin exposes Helm to large language models (such as Claude or GPT) via the [Model Context Protocol](https://modelcontextprotocol.io), allowing AI agents to directly operate on Helm data.

- **MCP Server**: Provides standard MCP endpoints at `/api/v1/plugins/helm-mcp/sse` and `/messages/`
- **Tool Registration**: Other plugins (e.g. fleet-action, srp) can register MCP tools via `extension_registry`
- **Built-in Core Tools**: Provides basic tools for querying users, characters, and permissions (CoreToolProvider)
- **Session Management**: Supports multiple concurrent SSE sessions with graceful shutdown on disable
- **Access Control**: Permission nodes control which users can connect via MCP

**Permissions**

| Permission | Description |
|------------|-------------|
| `mcp.access` | Access Helm system via MCP protocol |
| `mcp.admin` | Manage MCP configuration and view all session logs |

!!! tip "AI Agent Configuration"
    In Claude Desktop or any other MCP client, point the server address to `http://your-helm/api/v1/plugins/helm-mcp/sse` to connect.

---

### 🛡 Monitor — Security Threat Detection

| Field | Value |
|-------|-------|
| **PyPI Package** | `helm-plugin-monitor` |
| **Version** | `0.1.0` |
| **Author** | Jerry_Scintilla |
| **Source** | Not yet public |
| **Dependencies** | None |

**Overview**

The Monitor plugin automatically analyzes member EVE Online behavior to detect potential RMT (Real Money Trading), botting, or spy activity, assisting corporation/alliance security officers with personnel vetting.

- **Risk Profiles**: Builds a security score profile for each member based on wallet history, kill records, activity patterns, and more
- **Automated Scanning**: Syncs corp member data in the background via Celery scheduled tasks
- **Multi-level Permissions**: Members can view their own profile; security officers can view the entire corp and add manual annotations
- **Threshold Configuration**: Administrators can adjust risk indicator thresholds in the admin panel
- **Immediate Sync on Enable**: Triggers a member data sync and seeds default threshold config when first enabled

**Permissions**

| Permission | Scope | Description |
|------------|-------|-------------|
| `monitor.view_self` | character | View own risk profile |
| `monitor.view_corp` | corporation | View all corp member risk profiles |
| `monitor.annotate` | corporation | Add security annotations to members |
| `monitor.admin` | global | Manage rule thresholds and alliance-wide view |

**Required ESI Scopes**

- `esi-wallet.read_character_wallet.v1`
- `esi-corporations.read_member_tracking.v1`
- `esi-killmails.read_character_killmails.v1`
- `esi-characters.read_contacts.v1`
- `esi-location.read_location.v1`
- `esi-corporations.read_corporation_membership.v1`

!!! warning "Celery Worker"
    This plugin registers background scheduled tasks. After enabling it, you need to restart the Celery Worker for the tasks to take effect.

---

### 🛡️ SRP — Ship Replacement Program

| Field | Value |
|-------|-------|
| **PyPI Package** | `helm-plugin-srp` |
| **Version** | `0.1.0` |
| **Author** | Jerry_Scintilla |
| **Source** | [github.com/Jerry-Scintilla/helm-plugin-SRP](https://github.com/Jerry-Scintilla/helm-plugin-SRP) |
| **Dependencies** | None (optional integration: helm-plugin-fleet-action, helm-plugin-mcp) |

**Overview**

The SRP (Ship Replacement Program) plugin provides alliances with a complete ship loss compensation workflow, from killmail parsing to officer review.

- **zkillboard Link Parsing**: Members paste a killmail link; the plugin automatically fetches kill details and valuation via ESI
- **SRP Request Workflow**: Submit → Pending Review → Approved/Rejected — clear status transitions
- **Officer Review Interface**: Dedicated review panel with batch operations and compensation amount adjustment
- **Price Configuration**: Administrators can configure compensation ratios and caps per ship type
- **MOTD Integration**: If fleet-action is also enabled, automatically appends an SRP submission link to fleet MOTD when PAP is issued
- **MCP Tools**: If helm-plugin-mcp is also enabled, AI agents can manage SRP requests via MCP

**Permissions**

| Permission | Description |
|------------|-------------|
| `srp.submit` | Submit a ship replacement request |
| `srp.officer` | Review SRP requests (officer role) |
| `srp.admin` | Manage SRP configuration |

**Required ESI Scopes**

- `esi-killmails.read_killmails.v1`

---

## Plugin Integration Map

```
helm-plugin-fleet-action
    └── optional → helm-plugin-mcp  (registers MCP tools)
    └── optional → helm-plugin-srp  (inserts SRP link into fleet MOTD)

helm-plugin-srp
    └── optional → helm-plugin-mcp          (registers MCP tools)
    └── optional → helm-plugin-fleet-action (MOTD fragment provider)

helm-plugin-mcp
    └── aggregates all plugins that register under mcp.tool_provider

helm-plugin-monitor
    └── standalone — no cross-plugin dependencies
```

All integrations are **optional**: if a linked plugin is absent, the integration is silently skipped without affecting core functionality.

---

!!! tip "Building your own plugin?"
    See the [Plugin Development Guide](../plugin-dev/index.md) to learn how to build and publish plugins. Download the [AI Scaffold Skill](../downloads.md) to generate a plugin skeleton with Claude Code in one step.
