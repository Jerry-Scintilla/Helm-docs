# Market Price Service

Helm has a built-in market price service that provides unified buy/sell price lookups for other features (e.g., fitting valuation, ship price display).

## How It Works

The price service uses a **lazy-load + two-layer cache** architecture:

```
Requester
  ↓
[Market Cache Layer]  Redis  market:price:{region_id}:{type_id}  TTL = 1h (configurable)
    Hit → return immediately
    Miss
      ↓
[ESI Request Layer]  GET /markets/{region_id}/orders/?type_id=X&order_type=all
      ↓
[ESI Raw Cache]  esi:cache:/markets/...  TTL = 5min (built-in)
      ↓
    Compute best_buy / best_sell, write to cache
      ↓
    Return
```

- **On-demand fetching**: no pre-warming of all items — ESI is only called on first lookup
- **Per-item caching**: each `(region_id, type_id)` is cached independently
- **Concurrent batch**: when multiple items are requested at once, the cache is checked concurrently and missing items are fetched in bulk

---

## Admin Configuration

### Access the Market Config Page

Admin Panel → **Market** tab in the top bar, path: `/admin/market`.

### Set Default Query Region

The price service has a system-wide default query region (factory default: Jita · The Forge). Administrators can change this at any time.

**Steps:**

1. In the "Default Query Region" panel, use the dropdown to search and select the target region
2. Supports searching by region **name** (e.g., type "Amarr" or "The Forge")
3. Click **Save** — the new region takes effect immediately

!!! tip "Quick Switch"
    The dropdown has the five major trade hubs pre-listed, or you can search for other regions from the full list.

!!! info "Cache Isolation"
    Changing the default region does **not** clear the old region's cache — each cache key includes the `region_id`, so old and new regions are naturally independent. No data contamination occurs.

---

## Price Lookup Test

The "Random Price Lookup" panel lets you verify the market service is working correctly and test the effect of the current region configuration.

Click **Random Price Lookup** — the service will:

1. Pick a random **published, tradeable item** from the SDE
2. Query the best buy and sell price for that item in the current default region
3. Display the item name, buy price (green), sell price (orange), and spread

!!! warning "Requires SDE"
    The random item feature depends on the SDE database. If you see "SDE data is empty", complete a data import in the SDE tab first.

---

## .env Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MARKET_DEFAULT_REGION_ID` | `10000002` | Factory default region ID (The Forge / Jita). **After an admin changes this in the panel, the Redis value takes precedence; this config is only the initial value.** |
| `MARKET_PRICE_TTL` | `3600` | Price cache TTL (seconds). Increase to reduce ESI request frequency; decrease for fresher data. |

```env
# Market service
MARKET_DEFAULT_REGION_ID=10000002
MARKET_PRICE_TTL=3600
```

---

## Providing Price Data to Plugins

Other plugins can call `GET /api/v1/market/prices` directly to get price data without implementing their own ESI request logic.

```python
# Example from a plugin (Python, calling Helm's own API)
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

Or import and call `services.market` directly from plugin code:

```python
from app.services.market import get_market_prices

prices = await get_market_prices([34, 35, 36])
# prices[34].best_buy  → best buy price (float | None)
# prices[34].best_sell → best sell price (float | None)
```

---

## Common Region IDs Reference

| Region | region_id | Main Trade Hub |
|--------|-----------|----------------|
| The Forge | `10000002` | Jita (largest market in the game) |
| Domain | `10000043` | Amarr |
| Sinq Laison | `10000032` | Dodixie |
| Metropolis | `10000042` | Hek |
| Heimatar | `10000030` | Rens |
