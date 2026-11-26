
import pytest

from pydantic import ValidationError

from app.schemas import (
    UsuarioRegistro,
    Login,
    MascotaCrear,
    MascotaActualizar,
    RefugioRegistro,
    RefugioActualizarPerfil,
    RefugioCambiarPassword,
    AdopcionCrear,
    AdopcionActualizar,
    ContactoCrear,
    ContactoActualizar
)


# ==========================================
# PRUEBAS DE USUARIO
# ==========================================

@pytest.fixture
def datos_usuario():
    return {
        "nombre": "Usuario Prueba",
        "correo": "USUARIO@example.com",
        "password": "PasswordSeguro123!",
        "confirmar_password": "PasswordSeguro123!"
    }


def test_usuario_registro_valido(datos_usuario):
    usuario = UsuarioRegistro(**datos_usuario)

    assert usuario.nombre == "Usuario Prueba"
    assert usuario.correo == "usuario@example.com"


def test_usuario_nombre_invalido(datos_usuario):
    datos_usuario["nombre"] = "A"

    with pytest.raises(ValidationError):
        UsuarioRegistro(**datos_usuario)


def test_usuario_correo_invalido(datos_usuario):
    datos_usuario["correo"] = "correo_invalido"

    with pytest.raises(ValidationError):
        UsuarioRegistro(**datos_usuario)


def test_usuario_password_corta(datos_usuario):
    datos_usuario["password"] = "123"

    with pytest.raises(ValidationError):
        UsuarioRegistro(**datos_usuario)


def test_usuario_password_no_coincide(datos_usuario):
    datos_usuario["confirmar_password"] = "OtraPassword123!"

    with pytest.raises(ValidationError):
        UsuarioRegistro(**datos_usuario)


def test_usuario_confirmacion_opcional(datos_usuario):
    datos_usuario.pop("confirmar_password")

    usuario = UsuarioRegistro(**datos_usuario)

    assert usuario.confirmar_password is None


# ==========================================
# PRUEBAS DE LOGIN
# ==========================================

def test_login_valido():
    login = Login(
        correo="PRUEBA@example.com",
        password="PasswordSeguro123!"
    )

    assert login.correo == "prueba@example.com"


def test_login_correo_invalido():
    with pytest.raises(ValidationError):
        Login(
            correo="correo_invalido",
            password="PasswordSeguro123!"
        )


# ==========================================
# PRUEBAS DE MASCOTAS
# ==========================================

@pytest.fixture
def datos_mascota():
    return {
        "nombre": "Max",
        "tipo": "Perro",
        "edad": 3,
        "tamaño": "Mediano",
        "descripcion": "Mascota de prueba"
    }


def test_mascota_valida(datos_mascota):
    mascota = MascotaCrear(**datos_mascota)

    assert mascota.nombre == "Max"
    assert mascota.edad == 3
    assert mascota.tipo == "Perro"


@pytest.mark.parametrize("edad", [-1, 51])
def test_mascota_edad_invalida(datos_mascota, edad):
    datos_mascota["edad"] = edad

    with pytest.raises(ValidationError):
        MascotaCrear(**datos_mascota)


@pytest.mark.parametrize("edad", [0, 50])
def test_mascota_edad_limite(datos_mascota, edad):
    datos_mascota["edad"] = edad

    mascota = MascotaCrear(**datos_mascota)

    assert mascota.edad == edad


def test_mascota_nombre_vacio(datos_mascota):
    datos_mascota["nombre"] = ""

    with pytest.raises(ValidationError):
        MascotaCrear(**datos_mascota)


def test_mascota_actualizacion_parcial():
    mascota = MascotaActualizar(nombre="Luna")

    assert mascota.nombre == "Luna"
    assert mascota.edad is None


def test_mascota_actualizacion_edad_invalida():
    with pytest.raises(ValidationError):
        MascotaActualizar(edad=-1)


# ==========================================
# PRUEBAS DE REFUGIOS
# ==========================================

@pytest.fixture
def datos_refugio():
    return {
        "nombre_refugio": "Refugio Prueba",
        "nombre_responsable": "Responsable Prueba",
        "correo": "REFUGIO@example.com",
        "telefono": "3001234567",
        "ciudad": "Bogota",
        "direccion": "Calle 10 # 20-30",
        "password": "PasswordSeguro123!",
        "confirmar_password": "PasswordSeguro123!"
    }


def test_refugio_registro_valido(datos_refugio):
    refugio = RefugioRegistro(**datos_refugio)

    assert refugio.nombre_refugio == "Refugio Prueba"
    assert refugio.correo == "refugio@example.com"


def test_refugio_correo_invalido(datos_refugio):
    datos_refugio["correo"] = "correo_invalido"

    with pytest.raises(ValidationError):
        RefugioRegistro(**datos_refugio)


def test_refugio_telefono_invalido(datos_refugio):
    datos_refugio["telefono"] = "123"

    with pytest.raises(ValidationError):
        RefugioRegistro(**datos_refugio)


def test_refugio_password_corta(datos_refugio):
    datos_refugio["password"] = "123"

    with pytest.raises(ValidationError):
        RefugioRegistro(**datos_refugio)


def test_refugio_password_no_coincide(datos_refugio):
    datos_refugio["confirmar_password"] = "OtraPassword123!"

    with pytest.raises(ValidationError):
        RefugioRegistro(**datos_refugio)


def test_refugio_direccion_invalida(datos_refugio):
    datos_refugio["direccion"] = "abc"

    with pytest.raises(ValidationError):
        RefugioRegistro(**datos_refugio)


def test_refugio_actualizar_perfil():
    refugio = RefugioActualizarPerfil(
        ciudad="Bogota"
    )

    assert refugio.ciudad == "Bogota"


# ==========================================
# CAMBIO DE CONTRASENA
# ==========================================

def test_cambio_password_valido():
    datos = RefugioCambiarPassword(
        password_actual="PasswordAnterior123!",
        nueva_password="NuevaPassword123!",
        confirmar_nueva_password="NuevaPassword123!"
    )

    assert datos.nueva_password == "NuevaPassword123!"


def test_cambio_password_corta():
    with pytest.raises(ValidationError):
        RefugioCambiarPassword(
            password_actual="PasswordAnterior123!",
            nueva_password="123",
            confirmar_nueva_password="123"
        )


def test_cambio_password_no_coincide():
    with pytest.raises(ValidationError):
        RefugioCambiarPassword(
            password_actual="PasswordAnterior123!",
            nueva_password="NuevaPassword123!",
            confirmar_nueva_password="OtraPassword123!"
        )


# ==========================================
# PRUEBAS DE ADOPCIONES
# ==========================================

@pytest.fixture
def datos_adopcion():
    return {
        "mascota_id": 1,
        "telefono": "3001234567",
        "ciudad": "Bogota",
        "vivienda": "Casa",
        "otras_mascotas": "No",
        "motivo": "Ofrecer un hogar responsable"
    }


def test_adopcion_valida(datos_adopcion):
    adopcion = AdopcionCrear(**datos_adopcion)

    assert adopcion.mascota_id == 1
    assert adopcion.ciudad == "Bogota"


def test_adopcion_campos_opcionales(datos_adopcion):
    adopcion = AdopcionCrear(**datos_adopcion)

    assert adopcion.experiencia_mascotas is None
    assert adopcion.convivencia is None
    assert adopcion.referencias is None


def test_adopcion_campo_obligatorio(datos_adopcion):
    datos_adopcion.pop("motivo")

    with pytest.raises(ValidationError):
        AdopcionCrear(**datos_adopcion)


def test_adopcion_id_invalido(datos_adopcion):
    datos_adopcion["mascota_id"] = "abc"

    with pytest.raises(ValidationError):
        AdopcionCrear(**datos_adopcion)


def test_adopcion_aprobada():
    adopcion = AdopcionActualizar(
        estado="Aprobada"
    )

    assert adopcion.estado == "Aprobada"
    assert adopcion.motivo_rechazo is None


def test_adopcion_rechazada():
    adopcion = AdopcionActualizar(
        estado="Rechazada",
        motivo_rechazo="No cumple los requisitos"
    )

    assert adopcion.estado == "Rechazada"
    assert adopcion.motivo_rechazo == "No cumple los requisitos"


# ==========================================
# PRUEBAS DE CONTACTOS
# ==========================================

def test_contacto_valido():
    contacto = ContactoCrear(
        nombre="Usuario Prueba",
        correo="prueba@example.com",
        mensaje="Solicitud de informacion"
    )

    assert contacto.nombre == "Usuario Prueba"


def test_contacto_correo_invalido():
    with pytest.raises(ValidationError):
        ContactoCrear(
            nombre="Usuario Prueba",
            correo="correo_invalido",
            mensaje="Mensaje de prueba"
        )


def test_contacto_sin_mensaje():
    with pytest.raises(ValidationError):
        ContactoCrear(
            nombre="Usuario Prueba",
            correo="prueba@example.com"
        )


def test_contacto_actualizar():
    contacto = ContactoActualizar(
        estado="Respondido"
    )

    assert contacto.estado == "Respondido"
