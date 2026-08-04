from sqlmodel import Session, select
from app.models.refugio import Refugio


def obtener_refugios(session: Session):
    return session.exec(select(Refugio)).all()


def obtener_refugio(session: Session, refugio_id: int):
    return session.get(Refugio, refugio_id)


def crear_refugio(session: Session, refugio: Refugio):
    session.add(refugio)
    session.commit()
    session.refresh(refugio)
    return refugio


def actualizar_refugio(session: Session, refugio: Refugio):
    session.add(refugio)
    session.commit()
    session.refresh(refugio)
    return refugio


def eliminar_refugio(session: Session, refugio: Refugio):
    session.delete(refugio)
    session.commit()