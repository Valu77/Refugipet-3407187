from pydantic import BaseModel

class MascotaBase(BaseModel):
    nombre: str
    especie: str
    raza: str
    edad: int
    sexo: str
    tamaño: str
    estado_salud: str
    descripcion: str
    foto: str

class MascotaCrear(MascotaBase):
    refugio_id: int

class MascotaLeer(MascotaBase):
    id: int
    refugio_id: int

    class Config:
        from_attributes = True

class MascotaActualizar(BaseModel):
    nombre: str | None = None
    edad: int | None = None
    estado_salud: str | None = None
    descripcion: str | None = None