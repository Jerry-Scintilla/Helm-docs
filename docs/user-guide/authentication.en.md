# EVE SSO Login

Helm uses CCP's official **EVE Online Single Sign-On (SSO)** for authentication. No separate account registration is required — simply log in with your EVE account.

## Login Flow

1. Open the Helm website and click the **Login with EVE SSO** button
2. You are redirected to CCP's official login page (`login.eveonline.com`)
3. Enter your EVE account credentials (Helm never receives your password)
4. On the CCP authorization page, select the character you want to bind to Helm
5. Click **Authorize** and you will be redirected back to Helm
6. Login complete — you are taken to the Dashboard

!!! info "Security Note"
    Helm only receives an **OAuth Access Token** issued by CCP. It cannot access your EVE account password. The permission scope (ESI Scopes) of the Access Token is clearly shown on the authorization page.

## Multiple Character Binding

A single Helm account can bind **multiple characters** from the same EVE account.

**Adding a new character:**

1. After logging in, click your character avatar in the top-right corner → **Account Settings**
2. Click **Add Character**
3. Repeat the SSO authorization flow and select another character
4. The new character appears in your character list

## API Token Management

Helm supports generating long-lived **API Tokens** for programmatic access to the Helm REST API without requiring SSO authorization each time.

**Creating an API Token:**

1. Go to **Account Settings** → **API Tokens**
2. Click **Generate New Token**
3. Enter a name for the token (for easy identification)
4. Copy and save the generated token (**shown only once**)

**Using an API Token:**

```bash
curl https://your-helm-instance/api/v1/characters/me \
  -H "Authorization: Bearer <your-api-token>"
```

**Revoking a Token:**

In the **API Tokens** list, click the **Revoke** button next to the token to invalidate it immediately.

## Logout

Click your character avatar in the top-right corner → **Logout**. Helm will clear your local session. Note: this does not revoke the EVE SSO authorization. To fully revoke it, visit [CCP's official third-party application management page](https://community.eveonline.com/support/third-party-applications/).

## FAQ

**Q: After logging in I see "Character has no permission"?**

A: Your character has not been authorized to access Helm. Contact an administrator to assign the appropriate permissions.

**Q: ESI data is empty or outdated?**

A: ESI data is synced by a scheduled background job. After your first login, it may take a few minutes. Administrators can also manually trigger a sync.

**Q: After SSO authorization I land on an error page?**

A: Check that Helm's `EVE_CALLBACK_URL` exactly matches the Callback URL configured in the CCP Developer Portal.
