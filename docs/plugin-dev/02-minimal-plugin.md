# 2. 最小可工作插件

```python
# hello_helm/plugin.py
from fastapi import APIRouter
from app.plugins.base import HelmPlugin


class HelloPlugin(HelmPlugin):
    name = "hello"
    version = "0.1.0"
    author = "Your Name"
    description = "最简单的 Helm 插件示例"
    helm_sdk_version = ">=1.0,<2.0"

    def get_router(self) -> APIRouter:
        r = APIRouter()

        @r.get("/hello")
        def hello():
            return {"message": "Hello from plugin!"}

        return r
```

安装后访问 `GET /api/v1/plugins/hello/hello` 即返回 `{"message": "Hello from plugin!"}`。
