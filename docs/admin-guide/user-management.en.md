# Users & Permissions

Helm uses Role-Based Access Control (RBAC) with four permission scopes: global, character, corporation, and alliance.

## Permission Model

```
Permission Node
├── name        → "plugin-name.action", e.g. "market-scanner.read"
├── scope_type  → global / character / corporation / alliance
└── description → permission description
```

**Scope definitions:**

| Scope | Description | Example |
|-------|-------------|---------|
| `global` | Applies globally, regardless of character/corp | `admin.manage_plugins` |
| `character` | Applies to a specific EVE character | `character.view_assets` |
| `corporation` | Applies to a specific corporation | `corporation.view_finances` |
| `alliance` | Applies to a specific alliance | `alliance.view_members` |

## View the User List

Go to **Admin Panel → User Management** to see all users who have logged in and their bound characters.

## Assign Permissions

1. Find the target user in the user list
2. Click **Edit Permissions**
3. Check the permission nodes you want to grant
4. Select the scope as needed (global / specific corporation / specific alliance)
5. Click **Save**

**Via API:**
```bash
# Assign a global permission to a user
curl -X POST http://your-helm/api/v1/admin/users/{user_id}/permissions \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "market-scanner.read",
    "scope_type": "global"
  }'
```

## Built-in Permission Nodes

The following are Helm's key built-in permission nodes:

| Permission Node | Scope | Description |
|----------------|-------|-------------|
| `admin.manage_plugins` | global | Install, enable, disable, and uninstall plugins |
| `admin.manage_users` | global | Manage user permissions |
| `admin.view_tasks` | global | View task history |
| `character.view_assets` | character | View character assets |
| `character.view_wallet` | character | View character wallet |
| `corporation.view_members` | corporation | View corporation member list |
| `corporation.view_finances` | corporation | View corporation finances |
| `alliance.view_members` | alliance | View alliance member corporations |

Plugin-declared permission nodes are automatically registered when the plugin is installed and appear in the permissions list.

## Superadmin

Superadmins bypass all permission checks and have full access to all features.

- On first deployment, the character specified by `FIRST_SUPERUSER_CHAR_ID` in `.env` automatically becomes a superadmin
- Superadmins can grant or revoke superadmin status for other users via the user management page

!!! warning
    Superadmin privileges should be granted with care. For day-to-day operators, fine-grained permission nodes are recommended instead of granting superadmin status directly.

## API Token Management

Administrators can view and revoke any user's API tokens from the user management page:

1. Navigate to the target user's detail page
2. View all generated tokens in the **API Tokens** list
3. Click **Revoke** to immediately invalidate a specific token
