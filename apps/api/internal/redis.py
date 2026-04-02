import redis.asyncio as redis
from typing import Optional
from .config import settings

# Redis client
redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """Get Redis client instance."""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


async def close_redis():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


class CacheService:
    """Redis cache service for storing and retrieving data."""
    
    def __init__(self, redis_conn: redis.Redis):
        self.redis = redis_conn
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ttl: int = None) -> None:
        """Set value in cache with optional TTL."""
        if ttl:
            await self.redis.setex(key, ttl, value)
        else:
            await self.redis.set(key, value)
    
    async def delete(self, key: str) -> None:
        """Delete key from cache."""
        await self.redis.delete(key)

    async def increment(self, key: str, ttl: int) -> int:
        """Increment a counter and apply TTL on first write."""
        value = await self.redis.incr(key)
        if value == 1:
            await self.redis.expire(key, ttl)
        return int(value)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        return await self.redis.exists(key) > 0
    
    async def get_json(self, key: str) -> Optional[dict]:
        """Get JSON value from cache."""
        import json
        value = await self.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set_json(self, key: str, value: dict, ttl: int = None) -> None:
        """Set JSON value in cache."""
        import json
        await self.set(key, json.dumps(value), ttl)


async def get_cache() -> CacheService:
    """Dependency for getting cache service."""
    redis_conn = await get_redis()
    return CacheService(redis_conn)
