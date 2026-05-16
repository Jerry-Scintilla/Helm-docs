# 市场物价服务

Helm 内置市场物价服务，为其他功能（如装备估值、舰船价格展示）提供统一的买卖价查询支持。

## 工作原理

物价服务采用**懒加载 + 双层缓存**架构：

```
请求方
  ↓
[市场缓存层]  Redis  market:price:{region_id}:{type_id}  TTL = 1h（可配）
    命中 → 直接返回
    未命中
      ↓
[ESI 请求层]  GET /markets/{region_id}/orders/?type_id=X&order_type=all
      ↓
[ESI 原始缓存]  esi:cache:/markets/...  TTL = 5min（内置机制）
      ↓
    计算 best_buy / best_sell，写入缓存
      ↓
    返回
```

- **按需拉取**：不预热全量物品，仅在首次被查询时才调用 ESI
- **按物品缓存**：每个 `(region_id, type_id)` 独立缓存，互不影响
- **批量并发**：一次请求多个物品时，并发检查缓存并批量补全缺失数据

---

## 管理员配置

### 进入市场配置页

管理后台 → 顶栏「**市场**」标签，路径：`/admin/market`。

### 设置默认查询星域

物价服务有一个系统级默认查询星域（出厂默认为吉他 Jita · The Forge）。管理员可以随时修改。

**操作步骤：**

1. 在「默认查询星域」面板中，通过下拉框搜索并选择目标星域
2. 支持按星域**名称**直接搜索（如输入"阿马尔"或"Amarr"）
3. 点击「保存」，新区域立即生效

!!! tip "快速切换"
    下拉框已预置五大主要交易枢纽，也可从更长列表中搜索其他星域。

!!! info "缓存隔离"
    修改默认星域后，旧区域的缓存**不会被清除**——每条缓存键包含 `region_id`，新旧区域天然独立。不会造成数据污染。

---

## 物价检索测试

「物价随机检索」面板用于验证市场服务是否正常工作，以及测试当前区域配置的效果。

点击「**随机查询物价**」按钮，服务将：

1. 从 SDE 随机抽取一个**可交易的已发布物品**
2. 查询该物品在当前默认星域的最优买卖价
3. 展示物品名称、买价（绿色）、卖价（橙色）和价差

!!! warning "依赖 SDE"
    随机物品功能依赖 SDE 数据库。如果提示「SDE 数据为空」，请先在「SDE」标签页完成数据导入。

---

## .env 配置

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `MARKET_DEFAULT_REGION_ID` | `10000002` | 出厂默认星域 ID（The Forge / Jita）。**管理员在后台修改后，以 Redis 中的值为准，此配置项仅作初始值。** |
| `MARKET_PRICE_TTL` | `3600` | 物价缓存有效期（秒）。增大可减少 ESI 请求频率；减小可提高数据新鲜度。 |

```env
# 市场服务
MARKET_DEFAULT_REGION_ID=10000002
MARKET_PRICE_TTL=3600
```

---

## 为插件提供物价服务

其他插件可直接调用 `GET /api/v1/market/prices` 获取物价数据，无需自行实现 ESI 请求逻辑。

```python
# 插件内部调用示例（Python，调用 Helm 自身 API）
import httpx

async def get_prices(type_ids: list[int], token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "http://localhost:8000/api/v1/market/prices",
            params={"type_ids": ",".join(map(str, type_ids))},
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.json()
```

或者在插件代码中直接 import 并调用 `services.market`：

```python
from app.services.market import get_market_prices

prices = await get_market_prices([34, 35, 36])
# prices[34].best_buy  → 最优买价（float | None）
# prices[34].best_sell → 最优卖价（float | None）
```

---

## 常用星域 ID 参考

| 星域名 | region_id | 主要交易中心 |
|--------|-----------|------------|
| The Forge | `10000002` | 吉他 Jita（全服最大市场） |
| Domain | `10000043` | 阿马尔 Amarr |
| Sinq Laison | `10000032` | 都尔西 Dodixie |
| Metropolis | `10000042` | 海克 Hek |
| Heimatar | `10000030` | 鲁恩斯 Rens |
