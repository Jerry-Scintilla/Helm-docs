# 17. 角色模块扩展

插件可以通过两种方式扩展角色模块：

| 方式 | 说明 | 适合场景 |
|------|------|---------|
| **Widget 扩展** | 在角色总览页注入内容卡片 | 简单数据展示（统计、Markdown、小 iframe） |
| **子模块** | 注入完整独立子页面，拥有专属路由和侧边栏入口 | 复杂交互页面，需要插件自己的前端 SPA |

---

## 一、Widget 扩展（CharacterExtensionProvider）

### 扩展点名称

```
character.extension
```

### 实现接口

```python
from app.plugins.base import (
    HelmPlugin, PluginContext,
    CharacterExtensionProvider, CharacterExtension,
)
from app.plugins.registry import extension_registry

class MyPlugin(HelmPlugin, CharacterExtensionProvider):

    def on_enable(self, ctx: PluginContext):
        extension_registry.register("character.extension", self, self.name)

    def get_character_extension(
        self, character_id: int, db: AsyncSession
    ) -> CharacterExtension | None:
        # 返回 None 表示该角色不需要此插件的扩展
        return None
```

### CharacterExtension 数据类

```python
@dataclass
class CharacterExtension:
    character_id: int      # 必须与请求的角色 ID 匹配
    title: str             # 显示在扩展卡片标题
    widget: Literal["markdown", "stats", "iframe"]
    content: Any           # 内容格式见下表
    order: int = 100       # 越小越靠前
    css_class: str = ""    # 可选，自定义 CSS 类名
```

### Widget 类型与 Content 格式

| Widget | Content 格式 | 说明 |
|--------|-------------|------|
| `markdown` | `str` | Markdown 文本，自动渲染为 HTML（已消毒） |
| `stats` | `list[dict{label: str, value: str\|number}]` | 统计数值网格 |
| `iframe` | `dict{url: str, height?: int}` | 内嵌 iframe（高度默认 300px） |

### 示例

**Stats Widget**

```python
def get_character_extension(
    self, character_id: int, db: AsyncSession
) -> CharacterExtension | None:
    return CharacterExtension(
        character_id=character_id,
        title="战力分析",
        widget="stats",
        content=[
            {"label": "DPS", "value": 5000},
            {"label": "EHP", "value": 20000},
        ],
        order=10,
    )
```

**Markdown Widget**

```python
def get_character_extension(
    self, character_id: int, db: AsyncSession
) -> CharacterExtension | None:
    return CharacterExtension(
        character_id=character_id,
        title="备注",
        widget="markdown",
        content="## 角色备注\n\n这是一段 **Markdown** 格式的备注内容。",
        order=20,
    )
```

**Iframe Widget**

```python
def get_character_extension(
    self, character_id: int, db: AsyncSession
) -> CharacterExtension | None:
    return CharacterExtension(
        character_id=character_id,
        title="舰船装配",
        widget="iframe",
        content={"url": f"https://example.com/ship/{character_id}", "height": 400},
        order=30,
    )
```

**使用数据库查询**

```python
def get_character_extension(
    self, character_id: int, db: AsyncSession
) -> CharacterExtension | None:
    result = await db.execute(
        select(MyModel).where(MyModel.character_id == character_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        return None
    return CharacterExtension(character_id=character_id, title="...", ...)
```

### 注册与注销

| 操作 | 时机 | 说明 |
|------|------|------|
| 注册 | `on_enable()` | 调用 `extension_registry.register("character.extension", self, self.name)` |
| 注销 | 框架自动 | `disable_plugin()` / `uninstall_plugin()` 时自动调用 `unregister_plugin()` |

插件**不需要**在 `on_disable()` 中手动注销。

### 框架行为

- **数据验证**：自动验证返回的 `character_id` 是否与请求匹配，不匹配则忽略。
- **错误隔离**：提供者抛出的异常会被捕获并记录日志，不影响角色详情 API。
- **前端渲染**：扩展数据随角色详情 API 一起返回，在 Overview 页底部渲染为卡片网格。`markdown` 内容经 DOMPurify 消毒；`iframe` 以沙箱模式加载。

---

## 二、子模块（CharacterSubmodule）

子模块为插件在角色模块中提供完整的独立子页面，路由形如 `/character/2119650587/pap`，页面内容由插件自己的前端 SPA 通过 iframe 渲染。

### 声明子模块

在 `HelmPlugin` 子类中覆盖 `get_character_submodules()`：

```python
from app.plugins.base import HelmPlugin, CharacterSubmodule, PluginContext

class FleetActionPlugin(HelmPlugin):
    name = "fleet-action"

    def get_character_submodules(self) -> list[CharacterSubmodule]:
        base = self.get_frontend_dev_url() or f"/plugin-ui/{self.name}"
        return [
            CharacterSubmodule(
                slug="pap",
                label="出勤记录",
                icon="◈",
                iframe_url_template=f"{base}/character/{{character_id}}/pap",
                order=10,
            )
        ]
```

**无需注册到 ExtensionRegistry**。Helm 在安装/启用时自动将声明序列化进插件 meta，前端登录后读取并注册路由与菜单项。

### CharacterSubmodule 数据类

```python
@dataclass
class CharacterSubmodule:
    slug: str                   # URL 片段，全局唯一
    label: str                  # 侧边栏显示名
    iframe_url_template: str    # 含 {character_id} 占位符的 iframe URL
    icon: str = ""              # 可选 emoji 图标
    order: int = 100            # 在角色菜单中的排列顺序（越小越靠前）
```

### slug 命名规则

- 小写字母、数字、连字符，不含空格
- **不可与内置页面冲突**：`overview` `wallet` `skills` `assets` `mail` `notifications`
- 建议使用插件功能名，如 `pap`、`killboard`、`doctrine`

### iframe_url_template

URL 中的 `{character_id}` 占位符在运行时被替换为当前角色 ID：

```
http://localhost:5174/character/{character_id}/pap  →  http://localhost:5174/character/2119650587/pap
```

开发环境使用 `get_frontend_dev_url()` 的返回值，生产环境使用 `/plugin-ui/{name}`。

### SDK 通信

子模块 iframe 与普通 iframe 插件使用相同的 HelmSDK（见 [11. iframe 前端](11-iframe-frontend.md)）：

```javascript
HelmSDK.init(({ token, apiBase, locale }) => {
  // locale 为 'zh' 或 'en'，可直接用于插件内 i18n 初始化
  applyLocale(locale)

  // 使用 token 调用 Helm API
  fetch(`${apiBase}/api/v1/plugins/fleet-action/pap?character_id=...`, {
    headers: { Authorization: `Bearer ${token}` }
  })
})
```

> 用户切换语言时 iframe 会整页重载，插件无需监听语言变更事件，在 `init` 回调中读取 `locale` 即可。

### 多子模块

```python
def get_character_submodules(self) -> list[CharacterSubmodule]:
    base = self.get_frontend_dev_url() or f"/plugin-ui/{self.name}"
    return [
        CharacterSubmodule(slug="pap", label="出勤记录", icon="◈", order=10,
                           iframe_url_template=f"{base}/character/{{character_id}}/pap"),
        CharacterSubmodule(slug="doctrine", label="教义舰船", icon="◉", order=20,
                           iframe_url_template=f"{base}/character/{{character_id}}/doctrine"),
    ]
```

### 生命周期

| 时机 | 行为 |
|------|------|
| `install_plugin` / `enable_plugin` | `get_character_submodules()` 序列化进 meta，前端注册路由和菜单 |
| `disable_plugin` / `uninstall_plugin` | 前端自动移除路由和菜单项 |
