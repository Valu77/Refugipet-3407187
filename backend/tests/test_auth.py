
import pytest
import jwt

from types import SimpleNamespace
from unittest.mock import MagicMock
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.routers import auth
from app.schemas import UsuarioRegistro, RefugioRegistro, Login
from app.security import (
    hash_password,
    verify_password,
    SECRET_KEY,
    ALGORITHM
)
from app.rate_limiter import LoginRateLimiter


# ==========================================
# CONFIGURACION DE PRUEBAS
# ==========================================

@pytest.fixture
def db():
    return MagicMock()


@pytest.fixture(autouse=True)
def limiter(monkeypatch):
    nuevo_limiter = LoginRateLimiter()
    monkeypatch.setattr(auth, "login_rate_limiter", nuevo_limiter)
    return nuevo_limiter


@pytest.fixture
def usuario():
    return SimpleNamespace(
        id=1,
        nombre="Usuario Prueba",
        correo="prueba@example.com",
        password=hash_password("PasswordSeguro123!"),
        rol="usuario",
        refugio=None
    )


@pytest.fixture
def datos_registro():
    return UsuarioRegistro(
        nombre="Usuario Prueba",
        correo="prueba@example.com",
        password="PasswordSeguro123!",
        confirmar_password="PasswordSeguro123!"
    )


@pytest.fixture
def datos_refugio():
    return RefugioRegistro(
        nombre_refugio="Refugio Prueba",
        nombre_responsable="Responsable Prueba",
        correo="refugio@example.com",
        telefono="3001234567",
        ciudad="Bogota",
        direccion="Calle 10 # 20-30",
        password="PasswordSeguro123!",
        confirmar_password="PasswordSeguro123!"
    )


@pytest.fixture
def request_simulado():
    return SimpleNamespace(
        client=SimpleNamespace(host="127.0.0.1")
    )


@pytest.fixture
def datos_login():
    return Login(
        correo="prueba@example.com",
        password="PasswordSeguro123!"
    )


# ==========================================
# REGISTRO DE USUARIOS
# ==========================================

def test_registro_usuario_valido(db, datos_registro):
    db.query.return_value.filter.return_value.first.return_value = None

    resultado = auth.registrar(datos_registro, db)

    assert resultado.nombre == "Usuario Prueba"
    assert resultado.correo == "prueba@example.com"
    assert resultado.rol == "usuario"
    assert resultado.password != datos_registro.password
    assert verify_password(
        datos_registro.password,
        resultado.password
    )

    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


def test_registro_usuario_duplicado(db, datos_registro, usuario):
    db.query.return_value.filter.return_value.first.return_value = usuario

    with pytest.raises(HTTPException) as error:
        auth.registrar(datos_registro, db)

    assert error.value.status_code == 400
    db.commit.assert_not_called()


def test_registro_error_integridad(db, datos_registro):
    db.query.return_value.filter.return_value.first.return_value = None

    db.commit.side_effect = IntegrityError(
        "INSERT",
        {},
        Exception("Correo duplicado")
    )

    with pytest.raises(HTTPException) as error:
        auth.registrar(datos_registro, db)

    assert error.value.status_code == 400
    db.rollback.assert_called_once()


# ==========================================
# REGISTRO DE REFUGIOS
# ==========================================

def test_registro_refugio_valido(db, datos_refugio):
    db.query.return_value.filter.return_value.first.return_value = None

    resultado = auth.registrar_refugio(datos_refugio, db)

    assert resultado.nombre_refugio == "Refugio Prueba"
    assert resultado.estado == "pendiente"
    assert resultado.correo == "refugio@example.com"
    assert db.add.call_count == 2

    nuevo_usuario = db.add.call_args_list[0].args[0]

    assert nuevo_usuario.rol == "refugio"
    assert verify_password(
        datos_refugio.password,
        nuevo_usuario.password
    )

    db.flush.assert_called_once()
    db.commit.assert_called_once()


def test_registro_refugio_duplicado(db, datos_refugio, usuario):
    db.query.return_value.filter.return_value.first.return_value = usuario

    with pytest.raises(HTTPException) as error:
        auth.registrar_refugio(datos_refugio, db)

    assert error.value.status_code == 400
    db.commit.assert_not_called()


def test_registro_refugio_error_integridad(db, datos_refugio):
    db.query.return_value.filter.return_value.first.return_value = None

    db.commit.side_effect = IntegrityError(
        "INSERT",
        {},
        Exception("Error de integridad")
    )

    with pytest.raises(HTTPException) as error:
        auth.registrar_refugio(datos_refugio, db)

    assert error.value.status_code == 400
    db.rollback.assert_called_once()


# ==========================================
# INICIO DE SESION
# ==========================================

def test_login_correcto(
    db, usuario, datos_login, request_simulado
):
    db.query.return_value.filter.return_value.first.return_value = usuario

    resultado = auth.login(
        datos_login,
        request_simulado,
        db
    )

    assert resultado["token_type"] == "bearer"
    assert resultado["usuario"] == usuario

    payload = jwt.decode(
        resultado["access_token"],
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    assert payload["id"] == usuario.id
    assert payload["rol"] == "usuario"


def test_login_usuario_inexistente(
    db, datos_login, request_simulado
):
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as error:
        auth.login(datos_login, request_simulado, db)

    assert error.value.status_code == 401
    assert error.value.detail == "Correo o contraseña incorrectos"


def test_login_password_incorrecta(
    db, usuario, request_simulado
):
    db.query.return_value.filter.return_value.first.return_value = usuario

    datos = Login(
        correo="prueba@example.com",
        password="Incorrecta123!"
    )

    with pytest.raises(HTTPException) as error:
        auth.login(datos, request_simulado, db)

    assert error.value.status_code == 401


def test_login_bloqueo_intentos(
    db, usuario, request_simulado
):
    db.query.return_value.filter.return_value.first.return_value = usuario

    datos = Login(
        correo="prueba@example.com",
        password="Incorrecta123!"
    )

    for _ in range(5):
        with pytest.raises(HTTPException) as error:
            auth.login(datos, request_simulado, db)

        assert error.value.status_code == 401

    with pytest.raises(HTTPException) as error:
        auth.login(datos, request_simulado, db)

    assert error.value.status_code == 429


def test_login_sin_ip(db, usuario, datos_login):
    db.query.return_value.filter.return_value.first.return_value = usuario

    request = SimpleNamespace(client=None)

    resultado = auth.login(datos_login, request, db)

    assert resultado["token_type"] == "bearer"


def test_login_restablece_intentos(
    db, usuario, datos_login, request_simulado, limiter
):
    db.query.return_value.filter.return_value.first.return_value = usuario

    limiter.record_failed_attempt("ip:127.0.0.1")
    limiter.record_failed_attempt("email:prueba@example.com")

    auth.login(datos_login, request_simulado, db)

    assert limiter._attempts == {}


# ==========================================
# ESTADOS DEL REFUGIO
# ==========================================

@pytest.mark.parametrize(
    "estado",
    ["pendiente", "rechazado", "suspendido", "desconocido"]
)
def test_refugio_sin_autorizacion(db, usuario, estado):
    usuario.rol = "refugio"

    refugio = SimpleNamespace(
        estado=estado,
        motivo_rechazo="Documentacion incompleta",
        motivo_suspension="Incumplimiento"
    )

    db.query.return_value.filter.return_value.first.return_value = refugio

    with pytest.raises(HTTPException) as error:
        auth._validar_estado_refugio(usuario, db)

    assert error.value.status_code == 403


def test_refugio_aprobado(db, usuario):
    usuario.rol = "refugio"

    refugio = SimpleNamespace(estado="aprobado")

    db.query.return_value.filter.return_value.first.return_value = refugio

    assert auth._validar_estado_refugio(usuario, db) is None


def test_refugio_rechazado_sin_motivo(db, usuario):
    usuario.rol = "refugio"

    refugio = SimpleNamespace(
        estado="rechazado",
        motivo_rechazo=None
    )

    db.query.return_value.filter.return_value.first.return_value = refugio

    with pytest.raises(HTTPException) as error:
        auth._validar_estado_refugio(usuario, db)

    assert error.value.status_code == 403
    assert "No especificado" in error.value.detail


def test_refugio_suspendido_sin_motivo(db, usuario):
    usuario.rol = "refugio"

    refugio = SimpleNamespace(
        estado="suspendido",
        motivo_suspension=None
    )

    db.query.return_value.filter.return_value.first.return_value = refugio

    with pytest.raises(HTTPException) as error:
        auth._validar_estado_refugio(usuario, db)

    assert error.value.status_code == 403
    assert "temporalmente suspendido" in error.value.detail


def test_refugio_sin_registro(db, usuario):
    usuario.rol = "refugio"

    db.query.return_value.filter.return_value.first.return_value = None

    assert auth._validar_estado_refugio(usuario, db) is None


def test_token_refugio(usuario):
    usuario.rol = "refugio"
    usuario.refugio = SimpleNamespace(id=5)

    token = auth._generar_token_usuario(usuario)

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    assert payload["rol"] == "refugio"
    assert payload["refugio_id"] == 5


# ==========================================
# CONSULTA DE USUARIOS
# ==========================================

def test_obtener_perfil_actual(usuario):
    resultado = auth.obtener_perfil_actual(usuario)

    assert resultado == usuario


def test_listar_usuarios(db, usuario):
    db.query.return_value.order_by.return_value.all.return_value = [
        usuario
    ]

    resultado = auth.listar_usuarios(
        db=db,
        admin=usuario
    )

    assert len(resultado) == 1
    assert resultado[0] == usuario
