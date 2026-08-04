from typing import Optional
from datetime import date
from sqlmodel import SQLModel, Field

class Solicitud(SQLModel, table=True):
    __tablename__ = "solicitudes"

    id: Optional[int] = Field(default=None, primary_key=True)

    fecha: date
    estado: str

    usuario_id: int = Field(foreign_key="usuarios.id")
    mascota_id: int = Field(foreign_key="mascotas.id")