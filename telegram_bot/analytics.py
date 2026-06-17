import os
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError

logger = logging.getLogger(__name__)

class Analytics:
    def __init__(self):
        self.client = None
        self.db = None
        self.users_collection = None
        self._connect()

    def _connect(self):
        mongo_uri = os.environ.get("MONGODB_URI")
        if not mongo_uri:
            logger.error("MONGODB_URI environment variable not set. Analytics will be disabled.")
            return
        try:
            self.client = MongoClient(mongo_uri)
            self.client.admin.command('ping') # Test connection
            self.db = self.client.get_database()
            self.users_collection = self.db.users
            logger.info("Successfully connected to MongoDB for analytics.")
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection failed: {e}. Analytics will be disabled.")
            self.client = None
        except PyMongoError as e:
            logger.error(f"MongoDB error during connection setup: {e}. Analytics will be disabled.")
            self.client = None

    def track_user(self, user_id: int, username: str | None, first_name: str | None):
        if not self.users_collection:
            return
        
        now = datetime.utcnow()
        try:
            self.users_collection.update_one(
                {'user_id': user_id},
                {
                    '$set': {
                        'username': username,
                        'first_name': first_name,
                        'last_active': now
                    },
                    '$setOnInsert': {
                        'joined_at': now
                    }
                },
                upsert=True
            )
        except PyMongoError as e:
            logger.error(f"Failed to track user {user_id} in MongoDB: {e}")

    def get_stats(self) -> dict:
        if not self.users_collection:
            return {
                "total_users": 0,
                "new_users_today": 0,
                "active_users_today": 0,
                "users_this_week": 0
            }

        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        week_start = today_start - timedelta(days=today_start.weekday())

        try:
            total_users = self.users_collection.count_documents({})
            new_users_today = self.users_collection.count_documents({'joined_at': {'$gte': today_start}})
            active_users_today = self.users_collection.count_documents({'last_active': {'$gte': today_start}})
            users_this_week = self.users_collection.count_documents({'last_active': {'$gte': week_start}})

            return {
                "total_users": total_users,
                "new_users_today": new_users_today,
                "active_users_today": active_users_today,
                "users_this_week": users_this_week
            }
        except PyMongoError as e:
            logger.error(f"Failed to retrieve analytics stats from MongoDB: {e}")
            return {
                "total_users": 0,
                "new_users_today": 0,
                "active_users_today": 0,
                "users_this_week": 0
            }

analytics = Analytics()
