"""Local JSON filesystem repository for canonical profiles and applications."""

import json
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any

from core.config import settings
from core.exceptions import StorageError
from core.models.profile import MasterProfile
from storage.base import BaseStorageRepository


class LocalFileStorage(BaseStorageRepository):
    """File-based repository storing JSON documents in the user's data directory."""

    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or settings.data_dir
        self.profiles_dir = self.base_dir / "profiles"
        self.apps_dir = self.base_dir / "applications"
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        try:
            self.profiles_dir.mkdir(parents=True, exist_ok=True)
            self.apps_dir.mkdir(parents=True, exist_ok=True)
        except OSError:
            # Fallback to local workspace if target path is read-only
            fallback = Path(".saccade").resolve()
            self.profiles_dir = fallback / "profiles"
            self.apps_dir = fallback / "applications"
            self.profiles_dir.mkdir(parents=True, exist_ok=True)
            self.apps_dir.mkdir(parents=True, exist_ok=True)

    def save_profile(self, profile: MasterProfile) -> MasterProfile:
        profile_id = profile.id or "default_profile"
        target_path = self.profiles_dir / f"{profile_id}.json"
        try:
            target_path.write_text(profile.model_dump_json(indent=2), encoding="utf-8")
            return profile
        except Exception as e:
            raise StorageError(f"Failed to save profile '{profile_id}': {e}")

    def get_profile(self, profile_id: str = "default_profile") -> Optional[MasterProfile]:
        target_path = self.profiles_dir / f"{profile_id}.json"
        if not target_path.exists():
            # If default requested and not found, auto-fallback to first available profile
            if profile_id == "default_profile":
                available = sorted(self.profiles_dir.glob("*.json"))
                if available:
                    target_path = available[0]
                else:
                    return None
            else:
                return None
        try:
            data = json.loads(target_path.read_text(encoding="utf-8"))
            return MasterProfile.model_validate(data)
        except Exception as e:
            raise StorageError(f"Failed to load profile '{profile_id}': {e}")

    def list_profiles(self) -> List[str]:
        return [f.stem for f in self.profiles_dir.glob("*.json")]

    def save_application_record(self, record: Dict[str, Any]) -> str:
        app_id = record.get("id") or f"app_{uuid.uuid4().hex[:8]}"
        target_path = self.apps_dir / f"{app_id}.json"
        try:
            target_path.write_text(json.dumps(record, indent=2), encoding="utf-8")
            return app_id
        except Exception as e:
            raise StorageError(f"Failed to save application record '{app_id}': {e}")
