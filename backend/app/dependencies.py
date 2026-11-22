from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from .database import get_db
from .models import Usuario, Refugio
from .security import SECRET_KEY, ALGORITHM

security = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario_id_raw = payload.get("id") or payload.get("sub")

        if usuario_id_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: falta identificador de usuario",
                headers={"WWW-Authenticate": "Bearer"}
            )

        usuario_id = int(usuario_id_raw)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ha expirado, por favor inicia sesión nuevamente",
            headers={"WWW-Authenticate": "Bearer"}
        )

    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return usuario


def get_current_admin(
    usuario: Usuario = Depends(get_current_user)
) -> Usuario:

    if usuario.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requieren privilegios de administrador"
        )

    return usuario


def get_current_refugio(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if usuario.rol != "refugio":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere una cuenta de refugio"
        )

    refugio = db.query(Refugio).filter(Refugio.usuario_id == usuario.id).first()
    if not refugio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Información del refugio no encontrada"
        )

    if refugio.estado == "pendiente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu solicitud de registro como refugio está pendiente de aprobación por el administrador general."
        )

    if refugio.estado == "rechazado":
        motivo = refugio.motivo_rechazo or "No especificado"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tu solicitud de registro como refugio fue rechazada. Motivo: {motivo}"
        )

    if refugio.estado == "suspendido":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este refugio se encuentra suspendido. Por favor contacta al administrador."
        )

    if refugio.estado != "aprobado":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El refugio no cuenta con la autorización requerida."
        )

    return usuario, refugio