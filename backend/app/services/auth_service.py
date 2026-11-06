from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Configuration loaded from environment / settings
SECRET_KEY = settings.SECRET_KEY or "SKILLMATCH_ULTRA_SECRET_KEY_CHANGE_ME"
ALGORITHM = settings.ALGORITHM or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES or (60 * 24)

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Generates a signed JWT access token.

        Args:
            data (dict): Payload to include in the token.
            expires_delta (Optional[timedelta]): Custom expiration duration. Defaults to 15 minutes.

        Returns:
            str: The encoded JWT token.
        """
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decodes and validates a JWT access token.

        Args:
            token (str): The JWT token to decode.

        Returns:
            Optional[Dict[str, Any]]: The decoded payload if valid and contains a subject, else None.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload if payload.get("sub") else None
        except JWTError:
            return None

auth_service = AuthService()
