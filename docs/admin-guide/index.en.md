# Admin Guide

This section is for administrators of a Helm instance, covering user permission management, plugin management, and background task monitoring.

## Accessing the Admin Panel

After logging in, click your character avatar in the top-right corner → **Admin Panel** to navigate to the `/admin` page.

!!! note "Permission Required"
    The Admin Panel is only accessible to users with administrator permissions. On first deployment, the first user to log in (or the character ID specified in the config file) automatically receives admin privileges.

## Admin Panel Features

| Section | Path | Description |
|---------|------|-------------|
| System Status | `/admin/system` | View service runtime status and statistics |
| Users & Permissions | `/admin/users` | Assign roles and permissions to users |
| SDE Data | `/admin/sde` | Import / update EVE static data (SDE) |
| Plugin Management | `/admin/plugins` | Install, enable, disable, and uninstall plugins |
| **Plugin Marketplace** | — | Browse official plugins, versions, and feature descriptions |
| Task History | `/admin/tasks` | View background task execution records |
| **Market Prices** | `/admin/market` | Set the default query region and test the price service |

## Quick Tasks

| Task | Guide |
|------|-------|
| Browse available plugins | [Plugin Marketplace](plugin-marketplace.md) |
| Install a plugin | [Plugin Management → Install Plugin](plugins.md#install-a-plugin) |
| Assign permissions to a user | [Users & Permissions → Assign Permissions](user-management.md#assign-permissions) |
| View task execution logs | [Background Tasks → Task History](tasks.md#task-history) |
| Manually trigger a data sync | [Background Tasks → Manual Trigger](tasks.md#manually-trigger-a-task) |
| Change the market default region | [Market Price Service → Set Default Region](market.md#set-default-query-region) |
