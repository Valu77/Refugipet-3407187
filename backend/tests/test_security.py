
import jwt

from datetime import datetime, timezone
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)


def test_hash_password():
    password = "PruebaSegura123!"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$argon2id$")


def test_hash_password_unico():
    password = "PruebaSegura123!"

    hash1 = hash_password(password)
    hash2 = hash_password(password)

    assert hash1 != hash2


def test_verify_password_correcta():
    password = "PruebaSegura123!"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True


def test_verify_password_incorrecta():
    hashed = hash_password("PruebaSegura123!")

    assert verify_password("Incorrecta123!", hashed) is False


def test_verify_password_hash_invalido():
    assert verify_password("Prueba123!", "hash_invalido") is False


def test_create_access_token():
    datos = {
        "id": 1,
        "correo": "prueba@example.com",
        "rol": "usuario"
    }

    token = create_access_token(datos)

    assert isinstance(token, str)
    assert len(token) > 0


def test_contenido_token():
    datos = {
        "id": 1,
        "correo": "prueba@example.com",
        "rol": "usuario"
    }

    token = create_access_token(datos)

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    assert payload["id"] == 1
    assert payload["sub"] == "1"
    assert payload["correo"] == "prueba@example.com"
    assert payload["rol"] == "usuario"


def test_expiracion_token():
    token = create_access_token({"id": 1})

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    assert payload["exp"] > datetime.now(timezone.utc).timestamp()


def test_token_sin_id():
    token = create_access_token({"rol": "usuario"})

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    assert "sub" not in payload


def test_token_con_sub_existente():
    token = create_access_token({
        "id": 1,
        "sub": "usuario_prueba"
    })

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    assert payload["sub"] == "usuario_prueba"
