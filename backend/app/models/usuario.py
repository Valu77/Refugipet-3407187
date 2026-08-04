from typing import Optional
from sqlmodel import SQLModel, Field

class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    apellido: str
    correo: str = Field(index=True, unique=True)
    telefono: str
    contraseña: str
    rol_id: int