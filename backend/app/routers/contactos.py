from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from typing import List

from ..database import get_db

from ..models import Contacto

from ..schemas import (
    ContactoCrear,
    ContactoActualizar,
    ContactoRespuesta
)

from ..dependencies import get_current_admin


router = APIRouter(
    prefix="/contactos",
    tags=["Contactos"]
)


# ==========================================
# ENVIAR MENSAJE
# ==========================================

@router.post(
    "/",
    response_model=ContactoRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear_contacto(
    datos: ContactoCrear,
    db: Session = Depends(get_db)
):

    contacto = Contacto(
        nombre=datos.nombre,
        correo=datos.correo,
        mensaje=datos.mensaje,
        estado="No leído"
    )

    db.add(contacto)

    db.commit()

    db.refresh(contacto)

    return contacto


# ==========================================
# VER MENSAJES
# SOLO ADMIN
# ==========================================

@router.get(
    "/",
    response_model=List[ContactoRespuesta]
)
def obtener_contactos(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    contactos = db.query(
        Contacto
    ).order_by(
        Contacto.id.desc()
    ).all()

    return contactos


# ==========================================
# CAMBIAR ESTADO DEL MENSAJE
# SOLO ADMIN
# ==========================================

@router.put(
    "/{contacto_id}",
    response_model=ContactoRespuesta
)
def actualizar_contacto(
    contacto_id: int,
    datos: ContactoActualizar,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    contacto = db.query(
        Contacto
    ).filter(
        Contacto.id == contacto_id
    ).first()

    if not contacto:

        raise HTTPException(
            status_code=404,
            detail="Mensaje no encontrado"
        )

    contacto.estado = datos.estado

    db.commit()

    db.refresh(contacto)

    return contacto