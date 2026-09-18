"""Privacy-preserving, process-local Telegram usage counters.

The bot keeps no analytics data in an external service. Counters reset when the
process restarts and are intended only for the bot's in-process admin summary.
"""
from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock


class Analytics:
    def __init__(self) -> None:
        self._lock = Lock()
        self._users: dict[int, dict[str, object]] = {}

    def track_user(self, user_id: int, username: str | None, first_name: str | None) -> None:
        with self._lock:
            record = self._users.setdefault(user_id, {"joined_at": datetime.now(timezone.utc)})
            record.update({"username": username, "first_name": first_name, "last_active": datetime.now(timezone.utc)})

    def get_stats(self) -> dict:
        now = datetime.now(timezone.utc)
        today = now.date()
        with self._lock:
            return {
                "total_users": len(self._users),
                "new_users_today": sum(1 for r in self._users.values() if r["joined_at"].date() == today),
                "active_users_today": sum(1 for r in self._users.values() if r.get("last_active", now).date() == today),
                "users_this_week": sum(1 for r in self._users.values() if (now - r.get("last_active", now)).days < 7),
            }


analytics = Analytics()
