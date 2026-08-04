from sqlmodel import Session, select
from app.models.solicitud import Solicitud


def obtener_solicitudes(session: Session):
    return session.exec(select(Solicitud)).all()


def obtener_solicitud(session: Session, solicitud_id: int):
    return session.get(Solicitud, solicitud_id)


def crear_solicitud(session: Session, solicitud: Solicitud):
    session.add(solicitud)
    session.commit()
    session.refresh(solicitud)
    return solicitud


def actualizar_solicitud(session: Session, solicitud: Solicitud):
    session.add(solicitud)
    session.commit()
    session.refresh(solicitud)
    return solicitud


def eliminar_solicitud(session: Session, solicitud: Solicitud):
    session.delete(solicitud)
    session.commit()