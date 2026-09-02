from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from .database import Base


# ==========================================
# USUARIOS
# ==========================================

class Usuario(Base):

    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    correo = Column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    rol = Column(
        String(20),
        default="usuario",
        nullable=False
    )

    creado_en = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    adopciones = relationship(
        "Adopcion",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )


# ==========================================
# MASCOTAS
# ==========================================

class Mascota(Base):

    __tablename__ = "mascotas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    tipo = Column(
        String(50),
        nullable=False
    )

    edad = Column(
        Integer,
        nullable=False
    )

    tamaño = Column(
        String(50),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    imagen = Column(
        String(500),
        nullable=True
    )

    estado = Column(
        String(30),
        default="Disponible",
        nullable=False
    )

    creado_en = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    adopciones = relationship(
        "Adopcion",
        back_populates="mascota"
    )


# ==========================================
# ADOPCIONES
# ==========================================

class Adopcion(Base):

    __tablename__ = "adopciones"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    mascota_id = Column(
        Integer,
        ForeignKey("mascotas.id"),
        nullable=False
    )

    estado = Column(
        String(30),
        default="Pendiente",
        nullable=False
    )

    fecha = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    usuario = relationship(
        "Usuario",
        back_populates="adopciones"
    )

    mascota = relationship(
        "Mascota",
        back_populates="adopciones"
    )


# ==========================================
# CONTACTOS
# ==========================================

class Contacto(Base):

    __tablename__ = "contactos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    correo = Column(
        String(150),
        nullable=False
    )

    mensaje = Column(
        Text,
        nullable=False
    )

    estado = Column(
        String(30),
        default="No leído",
        nullable=False
    )

    fecha = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )