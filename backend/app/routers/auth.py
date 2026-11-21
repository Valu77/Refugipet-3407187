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
from ..models import Usuario

from ..schemas import (
    UsuarioRegistro,
    UsuarioRespuesta,
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
# LOGIN
# ==========================================

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

    # Obtener IP del cliente para mitigación de ataques distribuidos
    ip_cliente = request.client.host if request.client else "desconocida"

    # Claves para control de tasa (por IP y por cuenta objetivo)
    clave_ip = f"ip:{ip_cliente}"
    clave_cuenta = f"email:{correo_normalizado}"

    # 1. Comprobar bloqueo por demasiados intentos repetidos
    login_rate_limiter.check_rate_limit(clave_ip, "dirección IP")
    login_rate_limiter.check_rate_limit(clave_cuenta, "cuenta")

    usuario = db.query(
        Usuario
    ).filter(
        func.lower(Usuario.correo) == correo_normalizado
    ).first()

    if not usuario:
        # Registrar intento fallido para proteger contra enumeración y fuerza bruta
        login_rate_limiter.record_failed_attempt(clave_ip)
        login_rate_limiter.record_failed_attempt(clave_cuenta)

        # Hash simulado para evitar timing attacks (ataques de tiempo)
        verify_password(datos.password, "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    password_correcta = verify_password(
        datos.password,
        usuario.password
    )

    if not password_correcta:
        login_rate_limiter.record_failed_attempt(clave_ip)
        login_rate_limiter.record_failed_attempt(clave_cuenta)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    # Restablecer intentos fallidos tras inicio de sesión exitoso
    login_rate_limiter.reset_attempts(clave_ip)
    login_rate_limiter.reset_attempts(clave_cuenta)

    token = create_access_token(
        {
            "id": usuario.id,
            "correo": usuario.correo,
            "rol": usuario.rol
        }
    )

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