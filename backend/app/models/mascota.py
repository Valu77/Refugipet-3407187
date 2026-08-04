from typing import Optional
from sqlmodel import SQLModel, Field

class Mascota(SQLModel, table=True):
    __tablename__ = "mascotas"

    id: Optional[int] = Field(default=None, primary_key=True)

    nombre: str
    especie: str
    raza: str
    edad: int
    sexo: str
    tamaño: str
    estado_salud: str
    descripcion: str
    foto: str

    refugio_id: int = Field(foreign_key="refugios.id")