from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Notificacion, Usuario
from ..schemas import NotificacionListaRespuesta, NotificacionRespuesta
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/notificaciones",
    tags=["Notificaciones"]
)


@router.get("/", response_model=NotificacionListaRespuesta)
def listar_mis_notificaciones(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    items = db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario.id
    ).order_by(Notificacion.id.desc()).limit(30).all()

    no_leidas = db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario.id,
        Notificacion.leida == False  # noqa: E712
    ).count()

    return {
        "no_leidas": no_leidas,
        "items": items
    }


@router.put("/{notificacion_id}/leer", response_model=NotificacionRespuesta)
def marcar_notificacion_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    notif = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == usuario.id
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )

    notif.leida = True
    db.commit()
    db.refresh(notif)
    return notif


@router.put("/leer-todas")
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario.id,
        Notificacion.leida == False  # noqa: E712
    ).update({"leida": True})
    db.commit()
    return {"mensaje": "Todas las notificaciones fueron marcadas como leídas"}
