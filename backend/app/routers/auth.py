import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    status
)

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database import get_db
from ..models import Usuario, Refugio, PasswordResetToken

from ..schemas import (
    UsuarioRegistro,
    UsuarioRespuesta,
    UsuarioActualizarPerfil,
    UsuarioCambiarPassword,
    OlvidePasswordSolicitud,
    RestablecerPasswordSolicitud,
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

from ..rate_limiter import login_rate_limiter, password_reset_rate_limiter
from ..email_service import (
    enviar_correo_recuperacion,
    obtener_frontend_url,
    diagnosticar_smtp,
    smtp_configurado
)
from ..services_notificaciones import notificar_admins


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
        db.flush()

        notificar_admins(
            db=db,
            titulo="Nuevo refugio pendiente de aprobación",
            mensaje=(
                f"El refugio '{nuevo_refugio.nombre_refugio}' ({nuevo_refugio.ciudad}) "
                f"solicitó registro bajo la responsabilidad de {nuevo_refugio.nombre_responsable}."
            ),
            tipo="refugio_pendiente",
            enlace="/admin"
        )

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


@router.put(
    "/perfil",
    response_model=UsuarioRespuesta
)
def actualizar_perfil_usuario(
    datos: UsuarioActualizarPerfil,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    usuario.nombre = datos.nombre.strip()
    if usuario.rol == "refugio" and usuario.refugio:
        usuario.refugio.nombre_responsable = usuario.nombre
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put(
    "/cambiar-password"
)
def cambiar_password_usuario(
    datos: UsuarioCambiarPassword,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    if not verify_password(datos.password_actual, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta."
        )

    usuario.password = hash_password(datos.nueva_password)
    db.commit()

    return {
        "mensaje": "Contraseña actualizada exitosamente."
    }


# ==========================================
# RECUPERACIÓN DE CONTRASEÑA
# ==========================================

def _hash_reset_token(token_plano: str) -> str:
    return hashlib.sha256(token_plano.encode("utf-8")).hexdigest()


def _obtener_token_valido(db: Session, token_plano: str) -> PasswordResetToken:
    token_hash = _hash_reset_token(token_plano.strip())
    registro = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()

    if not registro or registro.usado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de recuperación es inválido o ya fue utilizado."
        )

    ahora = datetime.now(timezone.utc)
    expira = registro.expira_en
    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)

    if ahora >= expira:
        registro.usado = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de recuperación ha expirado. Por favor solicita uno nuevo."
        )

    return registro


@router.post(
    "/olvide-password"
)
def solicitar_recuperacion_password(
    datos: OlvidePasswordSolicitud,
    request: Request,
    db: Session = Depends(get_db)
):
    correo_normalizado = datos.correo.strip().lower()
    ip_cliente = request.client.host if request.client else "desconocida"

    clave_ip = f"reset_ip:{ip_cliente}"
    clave_correo = f"reset_email:{correo_normalizado}"

    password_reset_rate_limiter.check_rate_limit(clave_ip, "dirección IP")
    password_reset_rate_limiter.check_rate_limit(clave_correo, "cuenta")
    password_reset_rate_limiter.record_failed_attempt(clave_ip)
    password_reset_rate_limiter.record_failed_attempt(clave_correo)

    usuario = db.query(Usuario).filter(
        func.lower(Usuario.correo) == correo_normalizado
    ).first()

    if usuario:
        # Invalidar tokens previos activos del usuario
        db.query(PasswordResetToken).filter(
            PasswordResetToken.usuario_id == usuario.id,
            PasswordResetToken.usado == False  # noqa: E712
        ).update({"usado": True})

        token_plano = secrets.token_urlsafe(32)
        token_hash = _hash_reset_token(token_plano)
        expira_en = datetime.now(timezone.utc) + timedelta(minutes=30)

        nuevo_token = PasswordResetToken(
            usuario_id=usuario.id,
            token_hash=token_hash,
            expira_en=expira_en,
            usado=False
        )
        db.add(nuevo_token)
        db.commit()

        enlace = f"{obtener_frontend_url()}/restablecer-password?token={token_plano}"
        enviar_correo_recuperacion(
            destinatario=usuario.correo,
            nombre_usuario=usuario.nombre,
            enlace_recuperacion=enlace
        )
    else:
        # Trabajo de tiempo similar para evitar enumeración de usuarios
        _hash_reset_token(secrets.token_urlsafe(32))

    # Respuesta siempre neutra sin revelar si el correo existe
    return {
        "mensaje": (
            "Si el correo electrónico se encuentra registrado en RefugiPet, "
            "enviaremos un enlace seguro para restablecer tu contraseña (válido por 30 minutos)."
        )
    }


@router.get(
    "/validar-token-reset"
)
def validar_token_recuperacion(
    token: str = Query(..., min_length=16, max_length=256),
    db: Session = Depends(get_db)
):
    _obtener_token_valido(db, token)
    return {"valido": True}


@router.post(
    "/restablecer-password"
)
def restablecer_password(
    datos: RestablecerPasswordSolicitud,
    request: Request,
    db: Session = Depends(get_db)
):
    ip_cliente = request.client.host if request.client else "desconocida"
    clave_ip = f"reset_confirm_ip:{ip_cliente}"
    password_reset_rate_limiter.check_rate_limit(clave_ip, "dirección IP")

    registro = _obtener_token_valido(db, datos.token)

    usuario = db.query(Usuario).filter(
        Usuario.id == registro.usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    usuario.password = hash_password(datos.nueva_password)
    # Invalidar este token y cualquier otro pendiente del usuario (un solo uso)
    db.query(PasswordResetToken).filter(
        PasswordResetToken.usuario_id == usuario.id,
        PasswordResetToken.usado == False  # noqa: E712
    ).update({"usado": True})

    db.commit()
    password_reset_rate_limiter.reset_attempts(clave_ip)

    return {
        "mensaje": "Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña."
    }


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


# ==========================================
# DIAGNÓSTICO SMTP (solo admin — no expone credenciales)
# ==========================================

@router.get(
    "/smtp-status"
)
def estado_smtp(
    admin: Usuario = Depends(get_current_admin)
):
    """
    Devuelve el estado de configuración SMTP sin revelar las credenciales reales.
    Solo accesible por el administrador. Útil para verificar si el envío de
    correos está activo antes de la presentación.
    """
    return diagnosticar_smtp()
