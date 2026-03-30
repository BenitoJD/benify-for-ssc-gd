from minio import Minio
from minio.error import S3Error
from typing import Optional, BinaryIO
import uuid
from .config import settings

# MinIO client
minio_client: Optional[Minio] = None


def get_minio_client() -> Minio:
    """Get MinIO client instance."""
    global minio_client
    if minio_client is None:
        minio_client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
    return minio_client


async def ensure_bucket_exists():
    """Ensure the default bucket exists."""
    client = get_minio_client()
    if not client.bucket_exists(settings.MINIO_BUCKET):
        client.make_bucket(settings.MINIO_BUCKET)


class StorageService:
    """MinIO/S3 storage service for file uploads."""
    
    def __init__(self, client: Minio):
        self.client = client
        self.bucket = settings.MINIO_BUCKET
    
    def generate_filename(self, original_filename: str) -> str:
        """Generate a unique filename."""
        ext = original_filename.split('.')[-1] if '.' in original_filename else ''
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{ext}" if ext else unique_id
    
    async def upload_file(
        self,
        file_data: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = "uploads",
    ) -> str:
        """Upload a file and return the object name."""
        await ensure_bucket_exists()
        object_name = f"{folder}/{self.generate_filename(filename)}"
        
        self.client.put_object(
            self.bucket,
            object_name,
            file_data,
            length=-1,
            part_size=10 * 1024 * 1024,  # 10MB part size
            content_type=content_type,
        )
        
        return object_name
    
    async def get_presigned_url(self, object_name: str, expires: int = 3600) -> str:
        """Get a presigned URL for downloading a file."""
        await ensure_bucket_exists()
        return self.client.presigned_get_object(self.bucket, object_name, expires)
    
    async def delete_file(self, object_name: str) -> None:
        """Delete a file."""
        await ensure_bucket_exists()
        self.client.remove_object(self.bucket, object_name)
    
    async def file_exists(self, object_name: str) -> bool:
        """Check if a file exists."""
        await ensure_bucket_exists()
        try:
            self.client.stat_object(self.bucket, object_name)
            return True
        except S3Error:
            return False


def get_storage() -> StorageService:
    """Dependency for getting storage service."""
    return StorageService(get_minio_client())
