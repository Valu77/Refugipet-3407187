from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ==========================================
# USUARIO
# ==========================================

class UsuarioRegistro(BaseModel):

    nombre: str
    correo: EmailStr
    password: str


class UsuarioRespuesta(BaseModel):

    id: int
    nombre: str
    correo: EmailStr
    rol: str

    class Config:
        from_attributes = True


# ==========================================
# LOGIN
# ==========================================

class Login(BaseModel):

    correo: EmailStr
    password: str


class Token(BaseModel):

    access_token: str
    token_type: str
    usuario: UsuarioRespuesta


# ==========================================
# MASCOTAS
# ==========================================

class MascotaCrear(BaseModel):

    nombre: str
    tipo: str
    edad: int
    tamaño: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None


class MascotaActualizar(BaseModel):

    nombre: Optional[str] = None
    tipo: Optional[str] = None
    edad: Optional[int] = None
    tamaño: Optional[str] = None
    descripcion: Optional[str] = None
    imagen: Optional[str] = None
    estado: Optional[str] = None


class MascotaRespuesta(BaseModel):

    id: int
    nombre: str
    tipo: str
    edad: int
    tamaño: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None
    estado: str
    creado_en: datetime

    class Config:
        from_attributes = True



# ==========================================
# ADOPCIONES
# ==========================================

class AdopcionCrear(BaseModel):

    mascota_id: int
    telefono: str
    ciudad: str
    vivienda: str
    otras_mascotas: str
    motivo: str


class AdopcionActualizar(BaseModel):

    estado: str


class AdopcionRespuesta(BaseModel):

    id: int
    usuario_id: int
    mascota_id: int
    telefono: str
    ciudad: str
    vivienda: str
    otras_mascotas: str
    motivo: str
    estado: str
    fecha: datetime

    class Config:
        from_attributes = True


# ==========================================
# CONTACTO
# ==========================================

class ContactoCrear(BaseModel):

    nombre: str
    correo: EmailStr
    mensaje: str


class ContactoActualizar(BaseModel):

    estado: str


class ContactoRespuesta(BaseModel):

    id: int
    nombre: str
    correo: EmailStr
    mensaje: str
    estado: str
    fecha: datetime

    class Config:
        from_attributes = True