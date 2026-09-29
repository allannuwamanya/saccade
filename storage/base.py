"""Abstract persistence repository interface for career profiles and applications."""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from core.models.profile import MasterProfile


class BaseStorageRepository(ABC):
    """Abstract storage interface."""

    @abstractmethod
    def save_profile(self, profile: MasterProfile) -> MasterProfile:
        """Persists a canonical profile."""
        pass

    @abstractmethod
    def get_profile(self, profile_id: str = "default_profile") -> Optional[MasterProfile]:
        """Loads a profile by ID."""
        pass

    @abstractmethod
    def list_profiles(self) -> List[str]:
        """Lists all stored profile IDs."""
        pass

    @abstractmethod
    def save_application_record(self, record: Dict[str, Any]) -> str:
        """Saves a versioned record of a tailored application."""
        pass
