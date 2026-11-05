import os
import shutil
from pathlib import Path
from abc import ABC, abstractmethod
from typing import BinaryIO

class StorageProvider(ABC):
    @abstractmethod
    async def upload(self, file: BinaryIO, filename: str, folder: str = "") -> str:
        pass

    @abstractmethod
    async def delete(self, filename: str, folder: str = "") -> bool:
        pass

    @abstractmethod
    def get_url(self, filename: str, folder: str = "") -> str:
        pass

if os.environ.get("VERCEL"):
    DEFAULT_UPLOAD_DIR = Path("/tmp") / "skillmatch_uploads"
else:
    DEFAULT_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "static" / "uploads"


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = str(DEFAULT_UPLOAD_DIR)):
        self.base_dir = base_dir
        try:
            os.makedirs(self.base_dir, exist_ok=True)
        except OSError:
            self.base_dir = str(Path("/tmp") / "skillmatch_uploads")
            os.makedirs(self.base_dir, exist_ok=True)

    async def upload(self, file: BinaryIO, filename: str, folder: str = "") -> str:
        target_dir = os.path.join(self.base_dir, folder)
        os.makedirs(target_dir, exist_ok=True)

        target_path = os.path.join(target_dir, filename)
        with open(target_path, "wb") as f:
            shutil.copyfileobj(file, f)

        return os.path.join(folder, filename).replace("\\", "/")

    async def delete(self, filename: str, folder: str = "") -> bool:
        try:
            path = os.path.join(self.base_dir, folder, filename)
            if os.path.exists(path):
                os.remove(path)
                return True
            return False
        except Exception:
            return False

    def get_url(self, filename: str, folder: str = "") -> str:
        # Avoid duplicating folder if filename already starts with it
        norm_filename = filename.replace("\\", "/").lstrip("/")
        norm_folder = folder.replace("\\", "/").strip("/")
        if norm_folder and not norm_filename.startswith(norm_folder):
            clean_path = f"{norm_folder}/{norm_filename}"
        else:
            clean_path = norm_filename
        return f"/static/uploads/{clean_path}".replace("//", "/")

class S3StorageProvider(StorageProvider):
    # Placeholder for actual boto3 implementation
    def __init__(self, bucket_name: str):
        self.bucket = bucket_name

    async def upload(self, file: BinaryIO, filename: str, folder: str = "") -> str:
        # In real implementation: s3.upload_fileobj(file, self.bucket, f"{folder}/{filename}")
        return f"s3://{self.bucket}/{folder}/{filename}"

    async def delete(self, filename: str, folder: str = "") -> bool:
        # In real implementation: s3.delete_object(Bucket=self.bucket, Key=f"{folder}/{filename}")
        return True

    def get_url(self, filename: str, folder: str = "") -> str:
        return f"https://{self.bucket}.s3.amazonaws.com/{folder}/{filename}"

class CloudinaryStorageProvider(StorageProvider):
    """Cloudinary raw-file storage with local cache. Requires CLOUDINARY_URL or
    CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in the environment."""

    def __init__(self, base_dir: str = str(DEFAULT_UPLOAD_DIR)):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)
        try:
            import cloudinary
            cloudinary.config(
                cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
                api_key=os.getenv("CLOUDINARY_API_KEY", ""),
                api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
                secure=True,
            )
            self.configured = bool(os.getenv("CLOUDINARY_CLOUD_NAME"))
        except Exception:
            self.configured = False

    async def upload(self, file: BinaryIO, filename: str, folder: str = "") -> str:
        # Always write to local storage first so parsers and local services can read it
        target_dir = os.path.join(self.base_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, filename)

        try:
            file.seek(0)
        except Exception:
            pass

        with open(target_path, "wb") as f:
            shutil.copyfileobj(file, f)

        rel_path = os.path.join(folder, filename).replace("\\", "/")

        # Synchronize to Cloudinary if credentials are configured
        if self.configured:
            try:
                import cloudinary.uploader
                public_id = f"{folder}/{filename}".strip("/")
                cloudinary.uploader.upload(
                    target_path,
                    public_id=public_id,
                    resource_type="raw",
                    overwrite=True
                )
            except Exception as e:
                print(f"[Storage] Cloudinary sync warning (local copy preserved): {e}")

        return rel_path

    async def delete(self, filename: str, folder: str = "") -> bool:
        # Delete local copy
        try:
            local_path = os.path.join(self.base_dir, folder, filename)
            if os.path.exists(local_path):
                os.remove(local_path)
        except Exception:
            pass

        if self.configured:
            try:
                import cloudinary.uploader
                public_id = f"{folder}/{filename}".strip("/")
                cloudinary.uploader.destroy(public_id, resource_type="raw", invalidate=True)
                return True
            except Exception:
                return False
        return True

    def get_url(self, filename: str, folder: str = "") -> str:
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        if self.configured and cloud_name:
            public_id = f"{folder}/{filename}".strip("/")
            return f"https://res.cloudinary.com/{cloud_name}/raw/upload/{public_id}"
        norm_filename = filename.replace("\\", "/").lstrip("/")
        norm_folder = folder.replace("\\", "/").strip("/")
        if norm_folder and not norm_filename.startswith(norm_folder):
            clean_path = f"{norm_folder}/{norm_filename}"
        else:
            clean_path = norm_filename
        return f"/static/uploads/{clean_path}".replace("//", "/")


class StorageService:
    def __init__(self, provider: StorageProvider):
        self.provider = provider

    async def save_file(self, file: BinaryIO, filename: str, folder: str = "") -> str:
        return await self.provider.upload(file, filename, folder)

    async def remove_file(self, filename: str, folder: str = "") -> bool:
        return await self.provider.delete(filename, folder)

    def get_file_url(self, filename: str, folder: str = "") -> str:
        return self.provider.get_url(filename, folder)

# Dependency Injection Setup
_provider_type = os.getenv("STORAGE_TYPE", "local").lower()
if _provider_type == "cloudinary":
    try:
        storage_provider = CloudinaryStorageProvider()
    except Exception:
        storage_provider = LocalStorageProvider()
elif _provider_type == "s3":
    storage_provider = S3StorageProvider(os.getenv("S3_BUCKET_NAME", "skillmatch-dna-uploads"))
else:
    storage_provider = LocalStorageProvider()
storage_service = StorageService(storage_provider)
