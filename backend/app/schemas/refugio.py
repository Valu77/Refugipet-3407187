from pydantic import BaseModel, EmailStr

class RefugioBase(BaseModel):
    nombre: str
    direccion: str
    telefono: str
    correo: EmailStr
    descripcion: str

class RefugioCrear(RefugioBase):
    pass

class RefugioLeer(RefugioBase):
    id: int

    class Config:
        from_attributes = True

class RefugioActualizar(BaseModel):
    nombre: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    descripcion: str | None = None