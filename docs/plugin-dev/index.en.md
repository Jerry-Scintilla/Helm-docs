# Helm Plugin Development Guide

> **SDK Version**: `1.0.0` · **Compatibility**: `>=1.0,<2.0`  
> **Target server**: Helm Phase 3+

---

## Contents

| Chapter | File |
|---------|------|
| [1. Concepts Overview](01-concepts.md) | `01-concepts.md` |
| [2. Minimal Plugin](02-minimal-plugin.md) | `02-minimal-plugin.md` |
| [3. Package Structure & Entry Points](03-package-structure.md) | `03-package-structure.md` |
| [4. HelmPlugin Class Reference](04-helmplugin-reference.md) | `04-helmplugin-reference.md` |
| [5. Lifecycle Hooks](05-lifecycle-hooks.md) | `05-lifecycle-hooks.md` |
| [6. Register API Routes](06-api-router.md) | `06-api-router.md` |
| [7. Register Permissions](07-permissions.md) | `07-permissions.md` |
| [8. Register Celery Tasks](08-celery-tasks.md) | `08-celery-tasks.md` |
| [9. ESI Scope Declaration](09-esi-scopes.md) | `09-esi-scopes.md` |
| [10. Sidebar Menu](10-sidebar.md) | `10-sidebar.md` |
| [11. iframe Frontend](11-iframe-frontend.md) | `11-iframe-frontend.md` |
| [11b. Plugin Frontend Design Guide](11b-frontend-design.md) | `11b-frontend-design.md` |
| [12. Plugin Database Migrations](12-database-migrations.md) | `12-database-migrations.md` |
| [13. Plugin Communication](13-extension-registry.md) | `13-extension-registry.md` |
| [14. Local Testing](14-local-testing.md) | `14-local-testing.md` |
| [15. Publish to PyPI](15-publish-pypi.md) | `15-publish-pypi.md` |
| [16. API Endpoints Reference](16-api-endpoints.md) | `16-api-endpoints.md` |
| [17. Character Module Extension](17-character-extension.md) | `17-character-extension.md` |

---

## Appendix: SDK Version Compatibility Matrix

| Helm SDK | Features |
|---------|----------|
| `1.0.0` | Routes, tasks, permissions, ExtensionRegistry, iframe frontend (HelmSDK postMessage), character widget extension (CharacterExtensionProvider), character sub-modules (CharacterSubmodule) |
