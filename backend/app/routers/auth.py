from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status
)

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database import get_db
from ..models import Usuario, Refugio

from ..schemas import (
    UsuarioRegistro,
    UsuarioRespuesta,
    RefugioRegistro,
    RefugioRespuesta,
    Login,
    Token
)

from ..security import (
    hash_password,
    verify_password,
    create_access_token
)

from ..dependencies import (
    get_current_user,
    get_current_admin
)

from ..rate_limiter import login_rate_limiter


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


# ==========================================
# REGISTRO
# ==========================================

@router.post(
    "/registrar",
    response_model=UsuarioRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar(
    usuario: UsuarioRegistro,
    db: Session = Depends(get_db)
):
    correo_normalizado = usuario.correo.strip().lower()

    # Verificar si el correo ya existe en la base de datos (insensible a mayúsculas)
    usuario_existente = db.query(
        Usuario
    ).filter(
        func.lower(Usuario.correo) == correo_normalizado
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )

    # Hash seguro con Argon2id y salt único
    password_hasheada = hash_password(usuario.password)

    nuevo_usuario = Usuario(
        nombre=usuario.nombre.strip(),
        correo=correo_normalizado,
        password=password_hasheada,
        rol="usuario"
    )

    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )

    return nuevo_usuario


# ==========================================
# REGISTRO DE REFUGIO
# ==========================================

@router.post(
    "/registrar-refugio",
    response_model=RefugioRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_refugio(
    datos: RefugioRegistro,
    db: Session = Depends(get_db)
):
    correo_normalizado = datos.correo.strip().lower()

    # Verificar si el correo ya existe
    usuario_existente = db.query(
        Usuario
    ).filter(
        func.lower(Usuario.correo) == correo_normalizado
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )

    # Hash seguro con Argon2id
    password_hasheada = hash_password(datos.password)

    nuevo_usuario = Usuario(
        nombre=datos.nombre_responsable.strip(),
        correo=correo_normalizado,
        password=password_hasheada,
        rol="refugio"  # Seguridad: asignado por el servidor, nunca por petición
    )

    try:
        db.add(nuevo_usuario)
        db.flush()

        nuevo_refugio = Refugio(
            usuario_id=nuevo_usuario.id,
            nombre_refugio=datos.nombre_refugio.strip(),
            nombre_responsable=datos.nombre_responsable.strip(),
            telefono=datos.telefono.strip(),
            ciudad=datos.ciudad.strip(),
            direccion=datos.direccion.strip(),
            estado="pendiente"  # Por defecto siempre pendiente de aprobación
        )

        db.add(nuevo_refugio)
        db.commit()
        db.refresh(nuevo_refugio)

        # Inyectar correo para el response_model
        nuevo_refugio.correo = nuevo_usuario.correo
        return nuevo_refugio

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )


# ==========================================
# LOGIN
# ==========================================


# ==========================================
# LOGIN
# ==========================================

def _registrar_intento_fallido(clave_ip, clave_cuenta):
    login_rate_limiter.record_failed_attempt(clave_ip)
    login_rate_limiter.record_failed_attempt(clave_cuenta)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Correo o contraseña incorrectos"
    )


def _validar_credenciales(
    datos, correo_normalizado, db, clave_ip, clave_cuenta
):
    usuario = db.query(
        Usuario
    ).filter(
        func.lower(Usuario.correo) == correo_normalizado
    ).first()

    if not usuario:
        login_rate_limiter.record_failed_attempt(clave_ip)
        login_rate_limiter.record_failed_attempt(clave_cuenta)

        verify_password(
            datos.password,
            "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if not verify_password(datos.password, usuario.password):
        _registrar_intento_fallido(clave_ip, clave_cuenta)

    return usuario


def _validar_estado_refugio(usuario, db):
    if usuario.rol != "refugio":
        return

    refugio = db.query(Refugio).filter(
        Refugio.usuario_id == usuario.id
    ).first()

    if not refugio:
        return

    if refugio.estado == "pendiente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Tu solicitud de registro como refugio está "
                "pendiente de aprobación por el administrador general."
            )
        )

    if refugio.estado == "rechazado":
        motivo = (
            refugio.motivo_rechazo
            or "No especificado por el administrador"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tu solicitud de registro fue rechazada. Motivo: {motivo}"
        )

    if refugio.estado == "suspendido":
        motivo = getattr(refugio, "motivo_suspension", None)

        detalle = (
            f"Este refugio se encuentra suspendido. Motivo: {motivo}"
            if motivo
            else (
                "Este refugio se encuentra temporalmente suspendido. "
                "Por favor contacta al administrador general."
            )
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detalle
        )

    if refugio.estado != "aprobado":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta de refugio no cuenta con autorización activa."
        )


def _generar_token_usuario(usuario):
    payload_token = {
        "id": usuario.id,
        "correo": usuario.correo,
        "rol": usuario.rol
    }

    if usuario.rol == "refugio" and usuario.refugio:
        payload_token["refugio_id"] = usuario.refugio.id

    return create_access_token(payload_token)


@router.post(
    "/login",
    response_model=Token
)
def login(
    datos: Login,
    request: Request,
    db: Session = Depends(get_db)
):
    correo_normalizado = datos.correo.strip().lower()

    ip_cliente = (
        request.client.host
        if request.client
        else "desconocida"
    )

    clave_ip = f"ip:{ip_cliente}"
    clave_cuenta = f"email:{correo_normalizado}"

    login_rate_limiter.check_rate_limit(clave_ip, "dirección IP")
    login_rate_limiter.check_rate_limit(clave_cuenta, "cuenta")

    usuario = _validar_credenciales(
        datos,
        correo_normalizado,
        db,
        clave_ip,
        clave_cuenta
    )

    _validar_estado_refugio(usuario, db)

    login_rate_limiter.reset_attempts(clave_ip)
    login_rate_limiter.reset_attempts(clave_cuenta)

    token = _generar_token_usuario(usuario)

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario
    }


# ==========================================
# PERFIL ACTUAL (VERIFICACIÓN DE SESIÓN)
# ==========================================

@router.get(
    "/me",
    response_model=UsuarioRespuesta
)
def obtener_perfil_actual(
    usuario: Usuario = Depends(get_current_user)
):
    return usuario


# ==========================================
# LISTAR USUARIOS (SOLO ADMINISTRADOR)
# ==========================================

@router.get(
    "/usuarios",
    response_model=List[UsuarioRespuesta]
)
def listar_usuarios(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    return db.query(Usuario).order_by(Usuario.id.asc()).all()
