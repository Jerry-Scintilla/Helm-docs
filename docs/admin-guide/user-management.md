# 用户与权限

Helm 使用基于角色的访问控制（RBAC），支持四个权限作用域：全局、角色级、军团级、联盟级。

## 权限模型

```
权限节点 (Permission)
├── name        → "plugin-name.action"，如 "market-scanner.read"
├── scope_type  → global / character / corporation / alliance
└── description → 权限说明
```

**作用域说明：**

| 作用域 | 说明 | 示例 |
|--------|------|------|
| `global` | 全局生效，不区分角色/军团 | `admin.manage_plugins` |
| `character` | 针对特定 EVE 角色 | `character.view_assets` |
| `corporation` | 针对特定军团 | `corporation.view_finances` |
| `alliance` | 针对特定联盟 | `alliance.view_members` |

## 查看用户列表

进入 **管理后台 → 用户管理**，可以看到所有已登录的用户及其绑定角色。

## 分配权限

1. 在用户列表中找到目标用户
2. 点击 **编辑权限**
3. 在权限列表中勾选需要授予的权限节点
4. 按需选择作用范围（全局 / 指定军团 / 指定联盟）
5. 点击 **保存**

**API 方式：**
```bash
# 为用户分配全局权限
curl -X POST http://your-helm/api/v1/admin/users/{user_id}/permissions \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "market-scanner.read",
    "scope_type": "global"
  }'
```

## 管理员权限

以下是 Helm 内置的关键权限节点：

| 权限节点 | 作用域 | 说明 |
|---------|--------|------|
| `admin.manage_plugins` | global | 安装、启用、禁用、卸载插件 |
| `admin.manage_users` | global | 管理用户权限 |
| `admin.view_tasks` | global | 查看任务历史 |
| `character.view_assets` | character | 查看角色资产 |
| `character.view_wallet` | character | 查看角色钱包 |
| `corporation.view_members` | corporation | 查看军团成员 |
| `corporation.view_finances` | corporation | 查看军团财务 |
| `alliance.view_members` | alliance | 查看联盟成员军团 |

插件安装后会自动注册其声明的权限节点，出现在权限列表中。

## 超级管理员

超级管理员绕过所有权限检查，拥有所有功能的完整访问权。

- 首次部署时，`.env` 中 `FIRST_SUPERUSER_CHAR_ID` 指定的角色自动成为超级管理员
- 超级管理员可以在用户管理页面授予或撤销其他用户的超级管理员状态

!!! warning
    超级管理员权限应谨慎分配。一般运营人员建议使用精细权限节点，而非直接授予超级管理员。

## API Token 管理

管理员可以在用户管理页面查看和撤销任意用户的 API Token：

1. 进入目标用户的详情页
2. 在 **API Token** 列表中查看所有已生成的 Token
3. 点击 **撤销** 使特定 Token 立即失效
