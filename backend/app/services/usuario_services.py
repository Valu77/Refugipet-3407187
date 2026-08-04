from sqlmodel import Session, select
from app.models.usuario import Usuario


def obtener_usuarios(session: Session):
    return session.exec(select(Usuario)).all()


def obtener_usuario(session: Session, usuario_id: int):
    return session.get(Usuario, usuario_id)


def crear_usuario(session: Session, usuario: Usuario):
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario


def actualizar_usuario(session: Session, usuario: Usuario):
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario


def eliminar_usuario(session: Session, usuario: Usuario):
    session.delete(usuario)
    session.commit()