# 15. 发布到 PyPI

```bash
pip install build twine
python -m build
twine upload dist/*
```

包命名建议：`helm-plugin-{功能名}`，如 `helm-plugin-fleet-tracker`、`helm-plugin-mcp`。
