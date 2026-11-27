from typing import Optional
from sqlalchemy.orm import Session
from .models import Notificacion, Usuario


def crear_notificacion(
    db: Session,
    usuario_id: int,
    titulo: str,
    mensaje: str,
    tipo: str = "info",
    enlace: Optional[str] = None
) -> Notificacion:
    """Crea una notificación interna para un usuario específico."""
    notif = Notificacion(
        usuario_id=usuario_id,
        titulo=titulo[:150],
        mensaje=mensaje,
        tipo=tipo,
        enlace=enlace
    )
    db.add(notif)
    return notif


def notificar_admins(
    db: Session,
    titulo: str,
    mensaje: str,
    tipo: str = "info",
    enlace: Optional[str] = "/admin"
) -> None:
    """Envía una notificación interna a todos los administradores."""
    admins = db.query(Usuario.id).filter(Usuario.rol == "admin").all()
    for (admin_id,) in admins:
        crear_notificacion(
            db=db,
            usuario_id=admin_id,
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
            enlace=enlace
        )
