from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from typing import List

from ..database import get_db

from ..models import (
    Adopcion,
    Mascota,
    Usuario
)

from ..schemas import (
    AdopcionCrear,
    AdopcionActualizar,
    AdopcionRespuesta
)

from ..dependencies import (
    get_current_user,
    get_current_admin
)


router = APIRouter(
    prefix="/adopciones",
    tags=["Adopciones"]
)


# ==========================================
# CREAR SOLICITUD DE ADOPCIÓN
# ==========================================

@router.post(
    "/",
    response_model=AdopcionRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear_adopcion(
    datos: AdopcionCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):

    mascota = db.query(
        Mascota
    ).filter(
        Mascota.id == datos.mascota_id
    ).first()

    if not mascota:

        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    if mascota.estado != "Disponible":

        raise HTTPException(
            status_code=400,
            detail="Esta mascota no está disponible"
        )

    adopcion = Adopcion(
        usuario_id=usuario.id,
        mascota_id=datos.mascota_id,
        estado="Pendiente"
    )

    db.add(adopcion)

    db.commit()

    db.refresh(adopcion)

    return adopcion


# ==========================================
# VER TODAS LAS ADOPCIONES
# SOLO ADMIN
# ==========================================

@router.get(
    "/",
    response_model=List[AdopcionRespuesta]
)
def obtener_adopciones(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    adopciones = db.query(
        Adopcion
    ).order_by(
        Adopcion.id.desc()
    ).all()

    return adopciones


# ==========================================
# CAMBIAR ESTADO
# SOLO ADMIN
# ==========================================

@router.put(
    "/{adopcion_id}",
    response_model=AdopcionRespuesta
)
def actualizar_adopcion(
    adopcion_id: int,
    datos: AdopcionActualizar,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    adopcion = db.query(
        Adopcion
    ).filter(
        Adopcion.id == adopcion_id
    ).first()

    if not adopcion:

        raise HTTPException(
            status_code=404,
            detail="Solicitud no encontrada"
        )

    estados_validos = [
        "Pendiente",
        "Aprobada",
        "Rechazada"
    ]

    if datos.estado not in estados_validos:

        raise HTTPException(
            status_code=400,
            detail="Estado inválido"
        )

    adopcion.estado = datos.estado

    if datos.estado == "Aprobada":

        mascota = db.query(
            Mascota
        ).filter(
            Mascota.id == adopcion.mascota_id
        ).first()

        if mascota:

            mascota.estado = "Adoptada"

    db.commit()

    db.refresh(adopcion)

    return adopcion