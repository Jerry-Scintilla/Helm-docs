import os
import zipfile


def on_post_build(config, **kwargs):
    """Package the helm-plugin-dev skill into a zip for direct Claude Code import."""
    site_dir = config["site_dir"]
    docs_dir = config["docs_dir"]

    skill_root = os.path.join(docs_dir, "downloads", "helm-plugin-dev")
    zip_dest_dir = os.path.join(site_dir, "downloads")
    zip_path = os.path.join(zip_dest_dir, "helm-plugin-dev.zip")

    os.makedirs(zip_dest_dir, exist_ok=True)

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for dirpath, _, filenames in os.walk(skill_root):
            for filename in filenames:
                abs_path = os.path.join(dirpath, filename)
                # Arc path: helm-plugin-dev/... so extracting into .claude/skills/ gives the right layout
                arc_name = os.path.join(
                    "helm-plugin-dev",
                    os.path.relpath(abs_path, skill_root),
                )
                zf.write(abs_path, arc_name)
