import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
    UploadFile,
    File
)

from sqlalchemy.orm import Session
from sqlalchemy import or_

from typing import List

from ..database import get_db
from ..models import Mascota, Refugio, Adopcion

from ..schemas import (
    MascotaCrear,
    MascotaActualizar,
    MascotaRespuesta
)

from ..dependencies import (
    get_current_admin,
    get_current_admin_or_refugio
)


router = APIRouter(
    prefix="/mascotas",
    tags=["Mascotas"]
)

STATIC_MASCOTAS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "static",
    "mascotas"
)
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _normalizar_tamano(valor: str) -> str:
    limpio = valor.strip()
    if limpio.lower() == "pequeno":
        return "Pequeño"
    return limpio


def _enriquecer_mascota(mascota: Mascota) -> Mascota:
    if mascota.refugio:
        mascota.nombre_refugio = mascota.refugio.nombre_refugio
        mascota.ciudad_refugio = mascota.refugio.ciudad
    else:
        mascota.nombre_refugio = None
        mascota.ciudad_refugio = None
    return mascota


# ==========================================
# SUBIR IMAGEN DE MASCOTA
# ADMIN O REFUGIO APROBADO
# ==========================================

@router.post(
    "/subir-imagen",
    status_code=status.HTTP_201_CREATED
)
async def subir_imagen(
    request: Request,
    archivo: UploadFile = File(...),
    usuario = Depends(get_current_admin_or_refugio)
):

    extensiones_permitidas = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    nombre_original = archivo.filename or ""
    extension = os.path.splitext(nombre_original)[1].lower()

    if extension not in extensiones_permitidas:
        raise HTTPException(
            status_code=400,
            detail="Solo se permiten imagenes (jpg, jpeg, png, webp, gif)"
        )

    contenido = await archivo.read()
    if len(contenido) == 0:
        raise HTTPException(
            status_code=400,
            detail="El archivo de imagen está vacío"
        )
    if len(contenido) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="La imagen supera el tamaño máximo permitido de 5 MB"
        )

    nombre_archivo = f"{uuid.uuid4()}{extension}"

    os.makedirs(STATIC_MASCOTAS_DIR, exist_ok=True)
    ruta_completa = os.path.join(STATIC_MASCOTAS_DIR, nombre_archivo)

    with open(ruta_completa, "wb") as f:
        f.write(contenido)

    base_url = str(request.base_url).rstrip("/")
    url_imagen = f"{base_url}/static/mascotas/{nombre_archivo}"

    return {"url": url_imagen}


# ==========================================
# VER TODAS LAS MASCOTAS (CATÁLOGO PÚBLICO)
# ==========================================

@router.get(
    "/",
    response_model=List[MascotaRespuesta]
)
def obtener_mascotas(
    db: Session = Depends(get_db)
):

    mascotas = db.query(Mascota).outerjoin(
        Refugio, Mascota.refugio_id == Refugio.id
    ).filter(
        Mascota.estado != "Retirada",
        or_(
            Mascota.refugio_id.is_(None),
            Refugio.estado == "aprobado"
        )
    ).order_by(
        Mascota.id.desc()
    ).all()

    return [_enriquecer_mascota(m) for m in mascotas]


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
            status_code=404,
            detail="Mascota no encontrada"
        )

    return _enriquecer_mascota(mascota)


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
        nombre=datos.nombre.strip(),
        tipo=datos.tipo.strip(),
        edad=datos.edad,
        tamaño=_normalizar_tamano(datos.tamaño),
        descripcion=datos.descripcion.strip() if datos.descripcion else None,
        imagen=datos.imagen,
        estado="Disponible"
    )

    db.add(mascota)

    db.commit()

    db.refresh(mascota)

    return _enriquecer_mascota(mascota)


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
        if campo == "tamaño" and isinstance(valor, str):
            valor = _normalizar_tamano(valor)
        elif isinstance(valor, str):
            valor = valor.strip()

        setattr(
            mascota,
            campo,
            valor
        )

    db.commit()

    db.refresh(mascota)

    return _enriquecer_mascota(mascota)


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

    tiene_solicitudes = db.query(Adopcion).filter(
        Adopcion.mascota_id == mascota.id
    ).first()

    if tiene_solicitudes:
        mascota.estado = "Retirada"
        db.commit()
        return {
            "mensaje": "Mascota retirada del catálogo público conservando su historial de adopción.",
            "retirada": True
        }

    db.delete(mascota)

    db.commit()

    return {
        "mensaje": "Mascota eliminada correctamente",
        "retirada": False
    }