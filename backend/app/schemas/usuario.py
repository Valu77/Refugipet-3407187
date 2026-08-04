from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    correo: EmailStr
    telefono: str

class UsuarioCrear(UsuarioBase):
    contraseña: str
    rol_id: int

class UsuarioLeer(UsuarioBase):
    id: int
    rol_id: int

    class Config:
        from_attributes = True

class UsuarioActualizar(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    telefono: str | None = None