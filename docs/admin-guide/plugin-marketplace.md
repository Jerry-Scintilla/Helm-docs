# 插件市场

以下是目前官方提供的 Helm 插件，均可通过 PyPI 包名直接安装。每个插件都遵循 Helm 插件协议，支持热加载，无需重启服务。

---

## 安装方式快速参考

在管理后台 → **插件管理** → **安装插件** 中，输入对应 PyPI 包名即可一键安装。

```bash
# 也可使用 API 安装
curl -X POST http://your-helm/api/v1/admin/plugins/install \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"package_name": "<包名>"}'
```

详细操作步骤参见 [插件管理](plugins.md#安装插件)。

---

## 官方插件列表

### ⚔️ Fleet Action — 舰队行动管理

| 项目 | 内容 |
|------|------|
| **PyPI 包名** | `helm-plugin-fleet-action` |
| **版本** | `0.1.1` |
| **作者** | Jerry_Scintilla |
| **源码** | [github.com/Jerry-Scintilla/helm-plugin-fleet-action](https://github.com/Jerry-Scintilla/helm-plugin-fleet-action) |
| **依赖插件** | 无（可选联动：helm-plugin-mcp） |

**功能简介**

舰队行动（Fleet Action）插件用于管理 EVE Online 联盟的作战出勤记录，核心功能为手动发放 PAP（Participation Points）出勤积分。

- **舰队行动管理**：创建/结束舰队行动，记录 FC、舰队 ID 与行动描述
- **PAP 发放**：通过 ESI 实时读取舰队成员列表，一键向全员发放出勤积分
- **MOTD 更新**：发放 PAP 后自动更新舰队公告（MOTD），广播行动通知
- **出勤统计**：在角色档案页展示个人 PAP 记录，按月/年/总量聚合
- **MCP 工具集成**：若同时安装了 helm-plugin-mcp，AI 代理可通过 MCP 协议查询与创建行动

**权限节点**

| 权限 | 说明 |
|------|------|
| `fleet-action.read` | 查看舰队行动列表和 PAP 记录 |
| `fleet-action.manage` | 创建/结束舰队行动 |
| `fleet-action.pap` | 向当前舰队成员发放 PAP 并更新 MOTD |

**所需 ESI 作用域**

- `esi-fleets.read_fleet.v1`
- `esi-fleets.write_fleet.v1`

---

### 🤖 MCP Bridge — 大语言模型接入

| 项目 | 内容 |
|------|------|
| **PyPI 包名** | `helm-plugin-mcp` |
| **版本** | `0.1.2` |
| **作者** | Jerry_Scintilla |
| **源码** | [github.com/Jerry-Scintilla/helm-plugin-MCP](https://github.com/Jerry-Scintilla/helm-plugin-MCP) |
| **依赖插件** | 无（其他插件可注册工具以扩展 MCP 能力） |

**功能简介**

MCP Bridge 插件通过 [Model Context Protocol](https://modelcontextprotocol.io) 将 Helm 暴露给大型语言模型（如 Claude、GPT），使 AI 代理可以直接操作 Helm 数据。

- **MCP 服务端**：在 `/api/v1/plugins/helm-mcp/sse` 和 `/messages/` 上提供标准 MCP 端点
- **工具注册机制**：其他插件（如 fleet-action、srp）可通过 `extension_registry` 注册 MCP 工具，供 AI 代理调用
- **内置核心工具**：提供查询用户、角色、权限等基础工具（CoreToolProvider）
- **会话管理**：支持多并发 SSE 会话，禁用时优雅取消所有连接
- **访问控制**：通过权限节点控制哪些用户可以通过 MCP 接入

**权限节点**

| 权限 | 说明 |
|------|------|
| `mcp.access` | 通过 MCP 协议访问 Helm 系统 |
| `mcp.admin` | 管理 MCP 配置和查看所有会话日志 |

!!! tip "AI 代理配置"
    在 Claude Desktop 或其他 MCP 客户端中，将服务器地址指向 `http://your-helm/api/v1/plugins/helm-mcp/sse` 即可接入。

---

### 🛡 Monitor — 安全威胁监控

| 项目 | 内容 |
|------|------|
| **PyPI 包名** | `helm-plugin-monitor` |
| **版本** | `0.1.0` |
| **作者** | Jerry_Scintilla |
| **源码** | 暂未公开 |
| **依赖插件** | 无 |

**功能简介**

Monitor 插件对成员的 EVE 在线行为进行自动分析，检测潜在的 RMT（真实货币交易）、Bot 挂机或 Spy（间谍）风险，辅助军团/联盟安全官进行人员审查。

- **风险档案**：为每位成员建立安全评分档案，综合钱包流水、击杀记录、活跃时段等维度
- **自动扫描**：通过 Celery 定时任务后台同步军团成员数据，无需手动触发
- **多层级权限**：成员可查看自身档案，安全官可查看全团并添加人工标注
- **阈值配置**：管理员可在后台调整各项风险指标的触发阈值
- **启用即同步**：插件启用时自动触发一次成员数据同步，并写入默认阈值配置

**权限节点**

| 权限 | 作用域 | 说明 |
|------|--------|------|
| `monitor.view_self` | character | 查看自己的风险档案 |
| `monitor.view_corp` | corporation | 查看本公司全体成员风险档案 |
| `monitor.annotate` | corporation | 对成员进行安全标注 |
| `monitor.admin` | global | 管理规则阈值与全联盟视图 |

**所需 ESI 作用域**

- `esi-wallet.read_character_wallet.v1`
- `esi-corporations.read_member_tracking.v1`
- `esi-killmails.read_character_killmails.v1`
- `esi-characters.read_contacts.v1`
- `esi-location.read_location.v1`
- `esi-corporations.read_corporation_membership.v1`

!!! warning "Celery Worker"
    该插件注册了后台定时任务，启用后需要重启 Celery Worker 才能使任务生效。

---

### 🛡️ SRP — 舰船补损管理

| 项目 | 内容 |
|------|------|
| **PyPI 包名** | `helm-plugin-srp` |
| **版本** | `0.1.0` |
| **作者** | Jerry_Scintilla |
| **源码** | [github.com/Jerry-Scintilla/helm-plugin-SRP](https://github.com/Jerry-Scintilla/helm-plugin-SRP) |
| **依赖插件** | 无（可选联动：helm-plugin-fleet-action、helm-plugin-mcp） |

**功能简介**

SRP（Ship Replacement Program，舰船补损）插件为联盟提供完整的舰船损失补偿工作流，从击杀邮件解析到补损官审核全流程覆盖。

- **zkillboard 链接解析**：成员粘贴击杀邮件链接，自动通过 ESI 拉取击杀详情和估价
- **补损申请工作流**：提交 → 待审核 → 批准/拒绝，状态流转清晰
- **补损官审核界面**：专属审核面板，支持批量操作和补偿金额调整
- **价格配置**：管理员可配置各类舰船的补偿比例和上限
- **MOTD 联动**：若同时启用了 fleet-action 插件，发放 PAP 时自动在舰队 MOTD 中附加 SRP 申请链接
- **MCP 工具**：若同时启用了 helm-plugin-mcp，AI 代理可通过 MCP 协议管理补损申请

**权限节点**

| 权限 | 说明 |
|------|------|
| `srp.submit` | 提交补损申请 |
| `srp.officer` | 审核补损申请（补损官） |
| `srp.admin` | 管理补损配置 |

**所需 ESI 作用域**

- `esi-killmails.read_killmails.v1`

---

## 插件间联动关系

```
helm-plugin-fleet-action
    └── 可选联动 → helm-plugin-mcp（注册 MCP 工具）
    └── 可选联动 → helm-plugin-srp（MOTD 中插入 SRP 申请链接）

helm-plugin-srp
    └── 可选联动 → helm-plugin-mcp（注册 MCP 工具）
    └── 可选联动 → helm-plugin-fleet-action（MOTD fragment 提供者）

helm-plugin-mcp
    └── 汇聚所有注册了 mcp.tool_provider 的插件工具

helm-plugin-monitor
    └── 独立运行，无跨插件依赖
```

所有联动均为**可选**：缺少被联动插件时静默跳过，不影响各自核心功能。

---

!!! tip "开发自己的插件？"
    参阅 [插件开发指南](../plugin-dev/index.md) 了解如何构建和发布插件。下载 [AI 脚手架 Skill](../downloads.md) 可使用 Claude Code 一键生成插件骨架。
