from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

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

    usuario_existente = db.query(
        Usuario
    ).filter(
        Usuario.correo == usuario.correo
    ).first()

    if usuario_existente:

        raise HTTPException(
            status_code=400,
            detail="Este correo ya está registrado"
        )

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        correo=usuario.correo,
        password=hash_password(
            usuario.password
        ),
        rol="usuario"
    )

    db.add(nuevo_usuario)

    db.commit()

    db.refresh(nuevo_usuario)

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
    db: Session = Depends(get_db)
):

    usuario = db.query(
        Usuario
    ).filter(
        Usuario.correo == datos.correo
    ).first()

    if not usuario:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    password_correcta = verify_password(
        datos.password,
        usuario.password
    )

    if not password_correcta:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

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