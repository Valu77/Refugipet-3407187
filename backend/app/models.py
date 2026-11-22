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

    refugio = relationship(
        "Refugio",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan"
    )


# ==========================================
# REFUGIOS
# ==========================================

class Refugio(Base):

    __tablename__ = "refugios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    nombre_refugio = Column(
        String(150),
        nullable=False
    )

    nombre_responsable = Column(
        String(100),
        nullable=False
    )

    telefono = Column(
        String(30),
        nullable=False
    )

    ciudad = Column(
        String(100),
        nullable=False
    )

    direccion = Column(
        String(200),
        nullable=False
    )

    estado = Column(
        String(30),
        default="pendiente",
        nullable=False
    )

    motivo_rechazo = Column(
        Text,
        nullable=True
    )

    creado_en = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    usuario = relationship(
        "Usuario",
        back_populates="refugio"
    )

    mascotas = relationship(
        "Mascota",
        back_populates="refugio"
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

    refugio_id = Column(
        Integer,
        ForeignKey("refugios.id", ondelete="SET NULL"),
        nullable=True
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

    refugio = relationship(
        "Refugio",
        back_populates="mascotas"
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

    telefono = Column(
        String(30),
        nullable=False
    )

    ciudad = Column(
        String(100),
        nullable=False
    )

    vivienda = Column(
        String(50),
        nullable=False
    )

    otras_mascotas = Column(
        String(10),
        nullable=False
    )

    motivo = Column(
        Text,
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