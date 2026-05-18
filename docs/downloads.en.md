# Downloads

## Helm Plugin Dev — Claude Code Skill

`helm-plugin-dev` is a **Claude Code Skill** that helps you generate a complete plugin skeleton for the Helm project with a single command.

### Features

- Collects plugin requirements through an interactive Q&A
- Automatically generates all necessary files: `pyproject.toml`, `plugin.py`, routes, tasks, migrations, and frontend
- Provides ready-to-run local testing commands
- Built-in quality checklist

### Installation

The Skill must be installed in your **Helm project directory** (your Helm repo root), not in the global Claude configuration directory.

**Step 1: Create the directory structure in the Helm project root**

```
your-helm-project/
└── .claude/
    └── skills/
        └── helm-plugin-dev/
            ├── SKILL.md
            ├── references/
            │   └── api.md
            └── evals/
                └── evals.json
```

**Step 2: Download the files**

Download the following three files and place them in the corresponding directories:

| File | Download | Target Path |
|------|----------|-------------|
| `SKILL.md` | [Download](downloads/helm-plugin-dev/SKILL.md) | `.claude/skills/helm-plugin-dev/SKILL.md` |
| `api.md` | [Download](downloads/helm-plugin-dev/references/api.md) | `.claude/skills/helm-plugin-dev/references/api.md` |
| `evals.json` | [Download](downloads/helm-plugin-dev/evals/evals.json) | `.claude/skills/helm-plugin-dev/evals/evals.json` |

**Step 3: Use in Claude Code**

Open Claude Code (VS Code extension or CLI) in the Helm project directory and type:

```
/helm-plugin-dev
```

Or simply describe your requirements — Claude Code will automatically detect and trigger the Skill:

> "Create a Helm plugin to track corporation PAP activity records"

### Usage Example

The Skill starts with a Q&A:

```
1. Plugin name (URL slug): pap-tracker
2. Feature description: Track corp member PAP activity, record fleet participation counts
3. Required capabilities: REST API, Celery tasks, database tables, sidebar menu
4. Author name: Jerry
```

Then generates a complete plugin package including:
- `pyproject.toml` (with correct entry points)
- `pap_tracker/plugin.py`
- `pap_tracker/routers.py`
- `pap_tracker/tasks.py`
- `pap_tracker/models.py`
- `migrations/versions/0001_initial.py`
- Local testing steps (`pip install -e` + `curl` commands)

### Version Info

| Field | Value |
|-------|-------|
| Skill Version | 1.0.0 |
| Compatible Helm SDK | `>=1.0,<2.0` |
| Target Helm Version | Phase 3+ |

---

## Plugin Development Guide (Online)

The full plugin development documentation is available directly on this site: [Plugin Development Guide](plugin-dev/index.md)

Covers 17 chapters including: concepts overview, minimal plugin example, HelmPlugin API reference, lifecycle hooks, database migrations, ExtensionRegistry, and character page extensions.
