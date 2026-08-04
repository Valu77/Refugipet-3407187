from datetime import date
from pydantic import BaseModel

class SolicitudBase(BaseModel):
    fecha: date
    estado: str

class SolicitudCrear(SolicitudBase):
    usuario_id: int
    mascota_id: int

class SolicitudLeer(SolicitudBase):
    id: int
    usuario_id: int
    mascota_id: int

    class Config:
        from_attributes = True

class SolicitudActualizar(BaseModel):
    estado: str