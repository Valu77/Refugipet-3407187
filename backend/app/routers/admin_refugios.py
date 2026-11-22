from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query
)
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Refugio, Usuario, Mascota, Adopcion
from ..schemas import (
    RefugioRespuesta,
    RefugioGestionEstado,
    MascotaRespuesta
)
from ..dependencies import get_current_admin


router = APIRouter(
    prefix="/admin",
    tags=["Administración de Refugios"]
)


# ==========================================
# LISTAR REFUGIOS
# ==========================================

@router.get(
    "/refugios",
    response_model=List[RefugioRespuesta]
)
def listar_refugios(
    estado: Optional[str] = Query(None, description="Filtrar por estado: pendiente, aprobado, rechazado, suspendido"),
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    query = db.query(Refugio).join(Usuario, Refugio.usuario_id == Usuario.id)

    if estado:
        query = query.filter(Refugio.estado == estado.lower())

    refugios = query.order_by(Refugio.id.desc()).all()

    # Cargar correo y conteo de mascotas para cada refugio
    for r in refugios:
        r.correo = r.usuario.correo if r.usuario else None
        r.total_mascotas = db.query(Mascota).filter(Mascota.refugio_id == r.id).count()

    return refugios


# ==========================================
# APROBAR REFUGIO
# ==========================================

@router.put(
    "/refugios/{refugio_id}/aprobar",
    response_model=RefugioRespuesta
)
def aprobar_refugio(
    refugio_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    refugio = db.query(Refugio).filter(Refugio.id == refugio_id).first()
    if not refugio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refugio no encontrado"
        )

    refugio.estado = "aprobado"
    refugio.motivo_rechazo = None
    db.commit()
    db.refresh(refugio)

    refugio.correo = refugio.usuario.correo if refugio.usuario else None
    refugio.total_mascotas = db.query(Mascota).filter(Mascota.refugio_id == refugio.id).count()
    return refugio


# ==========================================
# RECHAZAR REFUGIO CON JUSTIFICACIÓN
# ==========================================

@router.put(
    "/refugios/{refugio_id}/rechazar",
    response_model=RefugioRespuesta
)
def rechazar_refugio(
    refugio_id: int,
    datos: RefugioGestionEstado,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    refugio = db.query(Refugio).filter(Refugio.id == refugio_id).first()
    if not refugio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refugio no encontrado"
        )

    if not datos.motivo_rechazo or len(datos.motivo_rechazo.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar una justificación clara de al menos 5 caracteres para rechazar la solicitud."
        )

    refugio.estado = "rechazado"
    refugio.motivo_rechazo = datos.motivo_rechazo.strip()
    db.commit()
    db.refresh(refugio)

    refugio.correo = refugio.usuario.correo if refugio.usuario else None
    refugio.total_mascotas = db.query(Mascota).filter(Mascota.refugio_id == refugio.id).count()
    return refugio


# ==========================================
# SUSPENDER / REACTIVAR REFUGIO
# ==========================================

@router.put(
    "/refugios/{refugio_id}/suspender",
    response_model=RefugioRespuesta
)
def suspender_refugio(
    refugio_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    refugio = db.query(Refugio).filter(Refugio.id == refugio_id).first()
    if not refugio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refugio no encontrado"
        )

    refugio.estado = "suspendido"
    db.commit()
    db.refresh(refugio)

    refugio.correo = refugio.usuario.correo if refugio.usuario else None
    refugio.total_mascotas = db.query(Mascota).filter(Mascota.refugio_id == refugio.id).count()
    return refugio


@router.put(
    "/refugios/{refugio_id}/reactivar",
    response_model=RefugioRespuesta
)
def reactivar_refugio(
    refugio_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    refugio = db.query(Refugio).filter(Refugio.id == refugio_id).first()
    if not refugio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refugio no encontrado"
        )

    refugio.estado = "aprobado"
    refugio.motivo_rechazo = None
    db.commit()
    db.refresh(refugio)

    refugio.correo = refugio.usuario.correo if refugio.usuario else None
    refugio.total_mascotas = db.query(Mascota).filter(Mascota.refugio_id == refugio.id).count()
    return refugio


# ==========================================
# SUPERVISAR MASCOTAS DE UN REFUGIO
# ==========================================

@router.get(
    "/refugios/{refugio_id}/mascotas",
    response_model=List[MascotaRespuesta]
)
def obtener_mascotas_de_refugio(
    refugio_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    refugio = db.query(Refugio).filter(Refugio.id == refugio_id).first()
    if not refugio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refugio no encontrado"
        )

    mascotas = db.query(Mascota).filter(
        Mascota.refugio_id == refugio_id
    ).order_by(Mascota.id.desc()).all()

    return mascotas


# ==========================================
# ESTADÍSTICAS GENERALES DE LA PLATAFORMA
# ==========================================

@router.get(
    "/estadisticas"
)
def obtener_estadisticas_generales(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin)
):
    total_usuarios = db.query(Usuario).filter(Usuario.rol == "usuario").count()
    total_refugios = db.query(Refugio).count()
    refugios_pendientes = db.query(Refugio).filter(Refugio.estado == "pendiente").count()
    total_mascotas = db.query(Mascota).count()
    mascotas_disponibles = db.query(Mascota).filter(Mascota.estado == "Disponible").count()
    mascotas_adoptadas = db.query(Mascota).filter(Mascota.estado == "Adoptada").count()
    total_adopciones = db.query(Adopcion).count()

    return {
        "total_usuarios": total_usuarios,
        "total_refugios": total_refugios,
        "refugios_pendientes": refugios_pendientes,
        "total_mascotas": total_mascotas,
        "mascotas_disponibles": mascotas_disponibles,
        "mascotas_adoptadas": mascotas_adoptadas,
        "total_adopciones": total_adopciones
    }
