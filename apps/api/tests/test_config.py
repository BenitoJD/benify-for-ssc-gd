from pathlib import Path

from internal.config import _resolve_root_env_file


def test_resolve_root_env_file_prefers_repo_root_env(tmp_path: Path) -> None:
    repo_root = tmp_path / "repo"
    config_path = repo_root / "apps" / "api" / "internal" / "config.py"
    root_env_file = repo_root / ".env"

    config_path.parent.mkdir(parents=True)
    config_path.write_text("# config\n", encoding="utf-8")
    root_env_file.write_text("JWT_SECRET_KEY=test\n", encoding="utf-8")

    assert _resolve_root_env_file(config_path) == root_env_file


def test_resolve_root_env_file_falls_back_for_container_layout(tmp_path: Path) -> None:
    config_path = tmp_path / "app" / "internal" / "config.py"
    expected_env_file = tmp_path / "app" / ".env"

    config_path.parent.mkdir(parents=True)
    config_path.write_text("# config\n", encoding="utf-8")

    assert _resolve_root_env_file(config_path) == expected_env_file
