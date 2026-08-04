from sqlmodel import Session, select
from app.models.mascota import Mascota


def obtener_mascotas(session: Session):
    return session.exec(select(Mascota)).all()


def obtener_mascota(session: Session, mascota_id: int):
    return session.get(Mascota, mascota_id)


def crear_mascota(session: Session, mascota: Mascota):
    session.add(mascota)
    session.commit()
    session.refresh(mascota)
    return mascota


def actualizar_mascota(session: Session, mascota: Mascota):
    session.add(mascota)
    session.commit()
    session.refresh(mascota)
    return mascota


def eliminar_mascota(session: Session, mascota: Mascota):
    session.delete(mascota)
    session.commit()