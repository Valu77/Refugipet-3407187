from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from ..database import get_db
from ..models import Favorito, Mascota, Refugio, Adopcion, Usuario
from ..schemas import MascotaRespuesta
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/favoritos",
    tags=["Favoritos"]
)


def _enriquecer_mascota_fav(mascota: Mascota, ids_en_proceso: set) -> Mascota:
    if mascota.refugio:
        mascota.nombre_refugio = mascota.refugio.nombre_refugio
        mascota.ciudad_refugio = mascota.refugio.ciudad
    else:
        mascota.nombre_refugio = None
        mascota.ciudad_refugio = None
    mascota.en_proceso = (
        mascota.estado == "Disponible" and mascota.id in ids_en_proceso
    )
    return mascota


@router.get("/", response_model=List[MascotaRespuesta])
def listar_favoritos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    mascotas = db.query(Mascota).join(
        Favorito, Favorito.mascota_id == Mascota.id
    ).outerjoin(
        Refugio, Mascota.refugio_id == Refugio.id
    ).filter(
        Favorito.usuario_id == usuario.id,
        Mascota.estado != "Retirada",
        or_(
            Mascota.refugio_id.is_(None),
            Refugio.estado == "aprobado"
        )
    ).order_by(Favorito.id.desc()).all()

    ids_en_proceso = {
        row[0]
        for row in db.query(Adopcion.mascota_id).filter(
            Adopcion.estado == "Pendiente"
        ).distinct().all()
    }

    return [_enriquecer_mascota_fav(m, ids_en_proceso) for m in mascotas]


@router.get("/ids", response_model=List[int])
def listar_ids_favoritos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    filas = db.query(Favorito.mascota_id).filter(
        Favorito.usuario_id == usuario.id
    ).all()
    return [row[0] for row in filas]


@router.post("/{mascota_id}", status_code=status.HTTP_201_CREATED)
def agregar_favorito(
    mascota_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    mascota = db.query(Mascota).outerjoin(
        Refugio, Mascota.refugio_id == Refugio.id
    ).filter(
        Mascota.id == mascota_id,
        Mascota.estado != "Retirada",
        or_(
            Mascota.refugio_id.is_(None),
            Refugio.estado == "aprobado"
        )
    ).first()

    if not mascota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mascota no encontrada"
        )

    existente = db.query(Favorito).filter(
        Favorito.usuario_id == usuario.id,
        Favorito.mascota_id == mascota_id
    ).first()

    if not existente:
        nuevo = Favorito(usuario_id=usuario.id, mascota_id=mascota_id)
        db.add(nuevo)
        db.commit()

    return {"mensaje": "Mascota agregada a favoritos", "mascota_id": mascota_id}


@router.delete("/{mascota_id}")
def eliminar_favorito(
    mascota_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    fav = db.query(Favorito).filter(
        Favorito.usuario_id == usuario.id,
        Favorito.mascota_id == mascota_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()

    return {"mensaje": "Mascota eliminada de favoritos", "mascota_id": mascota_id}
