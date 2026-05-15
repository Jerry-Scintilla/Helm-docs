# Helm Documentation

This repository is the official documentation site for **Helm**, an open-source EVE Online fleet management platform with a plugin-based architecture.

To learn more about Helm (including source code, installation, plugin development, etc.), please visit: https://github.com/Jerry-Scintilla/Helm

## Documentation Site

The documentation is live at: https://jerry-scintilla.github.io/Helm-docs/

## Project Structure

```
docs/
├── index.md               # Homepage
├── overview/              # Product overview, features, architecture
├── getting-started/       # Installation & configuration
├── user-guide/           # End-user guides
├── admin-guide/          # Administrator guides
├── plugin-dev/           # Plugin development guide (17 chapters)
├── api-reference/        # Core API reference
├── downloads/            # Downloadable assets (Claude Code skill)
└── stylesheets/          # Custom CSS (warm design system)
```

## Local Development

```bash
pip install -r requirements.txt
mkdocs serve
# → http://localhost:8000
```

## Build & Deploy

Push to `main` — GitHub Actions automatically builds and deploys to GitHub Pages.

```bash
# Manual build
mkdocs build

# Manual deploy (requires GitHub Pages configured)
mkdocs gh-deploy
```

## Contributing

1. Edit Markdown files under `docs/`
2. Run `mkdocs serve` to preview
3. Open a pull request

## License

Documentation text: GPL-3.0 (see [LICENSE](LICENSE)).
Helm source code: https://github.com/Jerry-Scintilla/Helm