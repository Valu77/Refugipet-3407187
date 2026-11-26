from pwdlib import PasswordHash
import jwt

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv(
    "SECRET_KEY", "refugipet_super_secret_jwt_key_2026_secure_key_change_in_production")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        480
    )
)

# Utiliza Argon2id como algoritmo de hashing recomendado
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Genera un hash seguro utilizando Argon2id con salt único por usuario."""
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """Verifica de forma segura la contraseña contra el hash almacenado."""
    try:
        return password_hash.verify(
            plain_password,
            hashed_password
        )
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    """Genera un token JWT firmado con fecha de expiración y sujeto."""
    to_encode = data.copy()

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    if "id" in data and "sub" not in to_encode:
        to_encode["sub"] = str(data["id"])

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt
