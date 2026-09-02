import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File
)

from sqlalchemy.orm import Session

from typing import List

from ..database import get_db
from ..models import Mascota

from ..schemas import (
    MascotaCrear,
    MascotaActualizar,
    MascotaRespuesta
)

from ..dependencies import get_current_admin


router = APIRouter(
    prefix="/mascotas",
    tags=["Mascotas"]
)


# ==========================================
# SUBIR IMAGEN DE MASCOTA
# SOLO ADMIN
# ==========================================

@router.post(
    "/subir-imagen",
    status_code=status.HTTP_201_CREATED
)
async def subir_imagen(
    archivo: UploadFile = File(...),
    admin = Depends(get_current_admin)
):

    extensiones_permitidas = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    extension = os.path.splitext(archivo.filename)[1].lower()

    if extension not in extensiones_permitidas:
        raise HTTPException(
            status_code=400,
            detail="Solo se permiten imagenes (jpg, jpeg, png, webp, gif)"
        )

    nombre_archivo = f"{uuid.uuid4()}{extension}"

    carpeta_destino = os.path.join("app", "static", "mascotas")
    os.makedirs(carpeta_destino, exist_ok=True)

    ruta_completa = os.path.join(carpeta_destino, nombre_archivo)

    contenido = await archivo.read()

    with open(ruta_completa, "wb") as f:
        f.write(contenido)

    url_imagen = f"http://127.0.0.1:8000/static/mascotas/{nombre_archivo}"

    return {"url": url_imagen}


# ==========================================
# VER TODAS LAS MASCOTAS
# ==========================================

@router.get(
    "/",
    response_model=List[MascotaRespuesta]
)
def obtener_mascotas(
    db: Session = Depends(get_db)
):

    mascotas = db.query(
        Mascota
    ).order_by(
        Mascota.id.desc()
    ).all()

    return mascotas


# ==========================================
# VER UNA MASCOTA
# ==========================================

@router.get(
    "/{mascota_id}",
    response_model=MascotaRespuesta
)
def obtener_mascota(
    mascota_id: int,
    db: Session = Depends(get_db)
):

    mascota = db.query(
        Mascota
    ).filter(
        Mascota.id == mascota_id
    ).first()

    if not mascota:

        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    return mascota


# ==========================================
# CREAR MASCOTA
# SOLO ADMIN
# ==========================================

@router.post(
    "/",
    response_model=MascotaRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear_mascota(
    datos: MascotaCrear,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    mascota = Mascota(
        nombre=datos.nombre,
        tipo=datos.tipo,
        edad=datos.edad,
        tamaño=datos.tamaño,
        descripcion=datos.descripcion,
        imagen=datos.imagen,
        estado="Disponible"
    )

    db.add(mascota)

    db.commit()

    db.refresh(mascota)

    return mascota


# ==========================================
# ACTUALIZAR MASCOTA
# SOLO ADMIN
# ==========================================

@router.put(
    "/{mascota_id}",
    response_model=MascotaRespuesta
)
def actualizar_mascota(
    mascota_id: int,
    datos: MascotaActualizar,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    mascota = db.query(
        Mascota
    ).filter(
        Mascota.id == mascota_id
    ).first()

    if not mascota:

        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )

    for campo, valor in datos_actualizados.items():

        setattr(
            mascota,
            campo,
            valor
        )

    db.commit()

    db.refresh(mascota)

    return mascota


# ==========================================
# ELIMINAR MASCOTA
# SOLO ADMIN
# ==========================================

@router.delete(
    "/{mascota_id}"
)
def eliminar_mascota(
    mascota_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):

    mascota = db.query(
        Mascota
    ).filter(
        Mascota.id == mascota_id
    ).first()

    if not mascota:

        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    db.delete(mascota)

    db.commit()

    return {
        "mensaje": "Mascota eliminada correctamente"
    }