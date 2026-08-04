from typing import Optional
from sqlmodel import SQLModel, Field

class Refugio(SQLModel, table=True):
    __tablename__ = "refugios"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    direccion: str
    telefono: str
    correo: str
    descripcion: str