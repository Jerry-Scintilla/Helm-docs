# EVE SSO 登录

Helm 使用 CCP 官方的 **EVE Online Single Sign-On (SSO)** 进行身份认证，无需注册单独账户，直接用你的 EVE 账号登录。

## 登录流程

1. 打开 Helm 网站，点击 **使用 EVE SSO 登录** 按钮
2. 页面跳转到 CCP 官方登录页面（`login.eveonline.com`）
3. 输入你的 EVE 账号和密码（Helm 不会接触你的密码）
4. 在 CCP 授权页选择你要绑定到 Helm 的角色
5. 点击 **授权**，跳转回 Helm
6. 登录完成，进入控制台

!!! info "安全说明"
    Helm 只会收到 CCP 颁发的 **OAuth Access Token**，无法获取你的 EVE 账号密码。Access Token 的权限范围（ESI Scopes）在授权页面会明确显示。

## 多角色绑定

一个 Helm 账户可绑定同一 EVE 主账户下的**多个角色**。

**添加新角色：**

1. 登录后，点击右上角头像 → **账户设置**
2. 点击 **添加角色**
3. 重复 SSO 授权流程，选择另一个角色
4. 新角色出现在角色列表中

## API Token 管理

Helm 支持生成长效 **API Token**，用于程序化访问 Helm REST API，无需每次 SSO 授权。

**创建 API Token：**

1. 进入 **账户设置** → **API Token**
2. 点击 **生成新 Token**
3. 输入 Token 名称（便于识别）
4. 复制并保存生成的 Token（**仅显示一次**）

**使用 API Token：**

```bash
curl https://your-helm-instance/api/v1/characters/me \
  -H "Authorization: Bearer <your-api-token>"
```

**注销 Token：**

在 **API Token** 列表中，点击对应 Token 的 **撤销** 按钮即可使其立即失效。

## 注销

点击右上角头像 → **注销**，Helm 将清除本地会话。注意：这不会撤销 EVE SSO 授权，如需完全撤销，请前往 [CCP 官方授权管理页](https://community.eveonline.com/support/third-party-applications/)。

## 常见问题

**Q：登录后提示「角色无权限」？**

A：你的角色没有被管理员授权访问 Helm。请联系管理员添加权限。

**Q：ESI 数据为空或过时？**

A：ESI 数据由后台定时同步，初次登录后可能需要等待几分钟。管理员也可以手动触发同步任务。

**Q：SSO 授权后跳转到错误页面？**

A：检查 Helm 的 `EVE_CALLBACK_URL` 配置是否与 CCP 开发者门户中的 Callback URL 完全一致。
