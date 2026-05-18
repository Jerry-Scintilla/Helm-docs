# User Guide

Welcome to Helm! This section is for fleet members and corporation managers who use Helm day-to-day, covering the core features and how to use them.

## Quick Start

```
1. Log in with EVE SSO         → authorize with your EVE account
2. View the Dashboard          → get an overview of your corp and characters
3. View character details      → skills, assets, wallet
4. View corporation info       → members, finances
5. Install plugins (admins)    → extend with more features
```

## Contents

| Section | Description |
|---------|-------------|
| [EVE SSO Login](authentication.md) | How to log in to Helm and manage bound characters |
| [Dashboard](dashboard.md) | Main interface layout and feature entry points |
| [Character Management](characters.md) | View character skills, assets, wallet, and mail |
| [Corporation Management](corporations.md) | Corporation members and financial overview |
| [Alliance Management](alliances.md) | Alliance member corporations and overview |

## Interface Layout

```
┌─────────────────────────────────────────────────────┐
│  ⚓ Helm                        [Character] [Logout] │  ← Top navigation bar
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  📊 Dashboard│                                      │
│  👤 Characters│          Main content area          │
│  🏢 Corp     │                                      │
│  🌐 Alliance │                                      │
│  ─────────── │                                      │
│  🔌 Plugin   │                                      │
│    menu      │                                      │
│  (entries    │                                      │
│   injected   │                                      │
│   by plugins)│                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
     Sidebar                   Content area
```

## Permissions

Helm uses RBAC (Role-Based Access Control). What each user can see depends on the permissions assigned by an administrator:

- **Global permissions**: e.g., `admin.manage_plugins`, controls global features
- **Character-level permissions**: e.g., viewing a specific character's assets
- **Corporation-level permissions**: e.g., viewing corporation finances
- **Alliance-level permissions**: e.g., viewing the alliance member list

If you cannot see a certain feature, contact your Helm administrator to have the appropriate permissions assigned.
