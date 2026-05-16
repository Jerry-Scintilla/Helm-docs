# 16. API 端点参考

## 插件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/admin/plugins/` | 列出所有插件 |
| `GET` | `/api/v1/admin/plugins/events` | SSE 事件流（`?token=<jwt>`） |
| `POST` | `/api/v1/admin/plugins/install` | 从 PyPI 安装 |
| `POST` | `/api/v1/admin/plugins/install/upload` | 上传 `.whl` 安装 |
| `POST` | `/api/v1/admin/plugins/{name}/enable` | 启用插件 |
| `POST` | `/api/v1/admin/plugins/{name}/disable` | 禁用插件 |
| `DELETE` | `/api/v1/admin/plugins/{name}` | 卸载（`?pip_remove=false`） |
| `GET` | `/api/v1/admin/plugins/{name}/status` | 状态检查 |
| `GET` | `/api/v1/plugins/` | **公开**：已启用插件清单 |
| `GET` | `/api/v1/plugins/{name}/ui-schema` | **公开**：插件 UI Schema |
| `*` | `/api/v1/plugins/{name}/*` | 插件自己注册的端点 |

---

## 市场价格查询

Helm 内置了市场价格服务，插件可以直接调用，无需自行对接 ESI。价格数据缓存于 Redis，命中缓存时直接返回，未命中则实时从 ESI 拉取后写入缓存。

### 公共端点

所需权限：`character.view`

#### `GET /api/v1/market/prices`

批量查询物品的最优买卖价。

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type_ids` | `string` | 是 | 逗号分隔的 `type_id` 列表，最多 50 个 |
| `region_id` | `integer` | 否 | 星域 ID；省略时使用管理员在后台配置的默认星域 |

**响应示例**

```json
{
  "region_id": 10000002,
  "prices": {
    "34": {
      "type_id": 34,
      "type_name": "三钛合金",
      "best_buy": 5.50,
      "best_sell": 5.80
    },
    "35": {
      "type_id": 35,
      "type_name": "超合金钢",
      "best_buy": 30.10,
      "best_sell": 31.00
    }
  }
}
```

- `best_buy`：所有买单中出价最高的价格（ISK）；无挂单时为 `null`
- `best_sell`：所有卖单中要价最低的价格（ISK）；无挂单时为 `null`

**在插件路由中调用示例**

```python
from app.services.market import get_market_prices

@router.get("/mineral-prices")
async def mineral_prices():
    MINERAL_IDS = [34, 35, 36, 37, 38, 39, 40]
    prices = await get_market_prices(MINERAL_IDS)
    return {
        tid: {"buy": p.best_buy, "sell": p.best_sell}
        for tid, p in prices.items()
    }
```

> **提示**：`get_market_prices` 的 `region_id` 参数可省略，省略时自动读取管理员配置的默认星域。

#### `GET /api/v1/market/random-item`

随机返回一个有市场分类的已发布物品，常用于演示或测试。

**响应示例**

```json
{
  "type_id": 34,
  "type_name": "三钛合金"
}
```

> 需要 SDE 数据已导入，否则返回 `404`。

---

### 管理端点

所需权限：`admin`

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/admin/market/config` | 获取当前默认星域 ID |
| `PUT` | `/api/v1/admin/market/config` | 更新默认星域 ID |

**`PUT /api/v1/admin/market/config` 请求体**

```json
{ "region_id": 10000002 }
```

默认星域 ID 存储于 Redis，修改后立即对所有后续查询生效（不影响已缓存条目）。
