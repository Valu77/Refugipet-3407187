from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import jwt

from dotenv import load_dotenv
import os

from .database import get_db
from .models import Usuario

load_dotenv()

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario_id = payload.get("id")

        if usuario_id is None:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

    except jwt.PyJWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )

    return usuario


def get_current_admin(
    usuario: Usuario = Depends(get_current_user)
):

    if usuario.rol != "admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )

    return usuario