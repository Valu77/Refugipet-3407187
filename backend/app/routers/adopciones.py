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
    Usuario,
    Refugio
)

from ..schemas import (
    AdopcionCrear,
    AdopcionActualizar,
    AdopcionRespuesta,
    AdopcionConDetallesRespuesta
)

from ..dependencies import (
    get_current_user,
    get_current_admin
)


router = APIRouter(
    prefix="/adopciones",
    tags=["Adopciones"]
)


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

    if not mascota or mascota.estado == "Retirada":
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    if mascota.refugio_id is not None:
        refugio = db.query(Refugio).filter(Refugio.id == mascota.refugio_id).first()
        if not refugio or refugio.estado != "aprobado":
            raise HTTPException(
                status_code=400,
                detail="Esta mascota no está disponible actualmente"
            )

    if mascota.estado != "Disponible":
        raise HTTPException(
            status_code=400,
            detail="Esta mascota no está disponible"
        )

    solicitud_existente = db.query(Adopcion).filter(
        Adopcion.usuario_id == usuario.id,
        Adopcion.mascota_id == datos.mascota_id,
        Adopcion.estado == "Pendiente"
    ).first()

    if solicitud_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una solicitud pendiente para esta mascota"
        )

    adopcion = Adopcion(
        usuario_id=usuario.id,
        mascota_id=datos.mascota_id,
        telefono=datos.telefono.strip(),
        ciudad=datos.ciudad.strip(),
        vivienda=datos.vivienda.strip(),
        otras_mascotas=datos.otras_mascotas.strip(),
        motivo=datos.motivo.strip(),
        estado="Pendiente"
    )

    db.add(adopcion)
    db.commit()
    db.refresh(adopcion)

    return adopcion


@router.get(
    "/mis-solicitudes",
    response_model=List[AdopcionConDetallesRespuesta]
)
def obtener_mis_solicitudes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    filas = db.query(Adopcion, Mascota).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).filter(
        Adopcion.usuario_id == usuario.id
    ).order_by(
        Adopcion.id.desc()
    ).all()

    resultado = []
    for adopcion, mascota in filas:
        adopcion.usuario_nombre = usuario.nombre
        adopcion.usuario_correo = usuario.correo
        adopcion.mascota_nombre = mascota.nombre
        adopcion.mascota_tipo = mascota.tipo
        adopcion.mascota_estado = mascota.estado
        adopcion.refugio_nombre = mascota.refugio.nombre_refugio if mascota.refugio else "RefugiPet (General)"
        resultado.append(adopcion)

    return resultado


@router.get(
    "/",
    response_model=List[AdopcionConDetallesRespuesta]
)
def obtener_adopciones(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    filas = db.query(
        Adopcion, Usuario, Mascota
    ).join(
        Usuario, Adopcion.usuario_id == Usuario.id
    ).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).order_by(
        Adopcion.id.desc()
    ).all()

    resultado = []
    for adopcion, solicitante, mascota in filas:
        adopcion.usuario_nombre = solicitante.nombre
        adopcion.usuario_correo = solicitante.correo
        adopcion.mascota_nombre = mascota.nombre
        adopcion.mascota_tipo = mascota.tipo
        adopcion.mascota_estado = mascota.estado
        adopcion.refugio_nombre = mascota.refugio.nombre_refugio if mascota.refugio else "RefugiPet (General)"
        resultado.append(adopcion)

    return resultado


@router.put(
    "/{adopcion_id}",
    response_model=AdopcionConDetallesRespuesta
)
def actualizar_adopcion(
    adopcion_id: int,
    datos: AdopcionActualizar,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
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

    mascota = db.query(
        Mascota
    ).filter(
        Mascota.id == adopcion.mascota_id
    ).first()

    if datos.estado == "Aprobada":
        if mascota and mascota.estado == "Adoptada" and adopcion.estado != "Aprobada":
            raise HTTPException(
                status_code=400,
                detail="Esta mascota ya fue marcada como adoptada en otra solicitud."
            )
        if mascota:
            mascota.estado = "Adoptada"

    adopcion.estado = datos.estado

    db.commit()
    db.refresh(adopcion)

    adopcion.usuario_nombre = adopcion.usuario.nombre if adopcion.usuario else None
    adopcion.usuario_correo = adopcion.usuario.correo if adopcion.usuario else None
    adopcion.mascota_nombre = mascota.nombre if mascota else None
    adopcion.mascota_tipo = mascota.tipo if mascota else None
    adopcion.mascota_estado = mascota.estado if mascota else None
    adopcion.refugio_nombre = mascota.refugio.nombre_refugio if mascota and mascota.refugio else "RefugiPet (General)"

    return adopcion