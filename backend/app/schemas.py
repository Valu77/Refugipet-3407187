from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime


# ==========================================
# USUARIO
# ==========================================

class UsuarioRegistro(BaseModel):

    nombre: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    password: str = Field(..., min_length=12, max_length=128)
    confirmar_password: Optional[str] = Field(None, min_length=12, max_length=128)

    @field_validator("correo")
    @classmethod
    def normalizar_correo(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

    @field_validator("password")
    @classmethod
    def validar_password_segura(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("La contraseña debe tener como mínimo 12 caracteres.")
        return v

    @model_validator(mode="after")
    def verificar_confirmacion_password(self):
        if self.confirmar_password is not None and self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden.")
        return self


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

    @field_validator("correo")
    @classmethod
    def normalizar_correo(cls, v: EmailStr) -> str:
        return str(v).strip().lower()


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
    refugio_id: Optional[int] = None
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
# REFUGIO SCHEMAS
# ==========================================

class RefugioRegistro(BaseModel):

    nombre_refugio: str = Field(..., min_length=2, max_length=150)
    nombre_responsable: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    telefono: str = Field(..., min_length=7, max_length=30)
    ciudad: str = Field(..., min_length=2, max_length=100)
    direccion: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=12, max_length=128)
    confirmar_password: str = Field(..., min_length=12, max_length=128)

    @field_validator("correo")
    @classmethod
    def normalizar_correo(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

    @field_validator("password")
    @classmethod
    def validar_password_segura(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("La contraseña debe tener como mínimo 12 caracteres.")
        return v

    @model_validator(mode="after")
    def verificar_confirmacion_password(self):
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden.")
        return self


class RefugioRespuesta(BaseModel):

    id: int
    usuario_id: int
    nombre_refugio: str
    nombre_responsable: str
    correo: Optional[EmailStr] = None
    telefono: str
    ciudad: str
    direccion: str
    estado: str
    motivo_rechazo: Optional[str] = None
    total_mascotas: Optional[int] = None
    creado_en: datetime

    class Config:
        from_attributes = True


class RefugioActualizarPerfil(BaseModel):

    nombre_refugio: Optional[str] = Field(None, min_length=2, max_length=150)
    nombre_responsable: Optional[str] = Field(None, min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, min_length=7, max_length=30)
    ciudad: Optional[str] = Field(None, min_length=2, max_length=100)
    direccion: Optional[str] = Field(None, min_length=5, max_length=200)


class RefugioCambiarPassword(BaseModel):

    password_actual: str
    nueva_password: str = Field(..., min_length=12, max_length=128)
    confirmar_nueva_password: str = Field(..., min_length=12, max_length=128)

    @field_validator("nueva_password")
    @classmethod
    def validar_password_segura(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("La nueva contraseña debe tener como mínimo 12 caracteres.")
        return v

    @model_validator(mode="after")
    def verificar_confirmacion_password(self):
        if self.nueva_password != self.confirmar_nueva_password:
            raise ValueError("Las nuevas contraseñas no coinciden.")
        return self


class RefugioGestionEstado(BaseModel):

    estado: str
    motivo_rechazo: Optional[str] = None


class DashboardRefugioRespuesta(BaseModel):

    total_mascotas: int
    mascotas_disponibles: int
    mascotas_adoptadas: int
    solicitudes_pendientes: int
    solicitudes_totales: int


class SolicitanteInfo(BaseModel):

    id: int
    nombre: str
    correo: EmailStr


class AdopcionConSolicitanteRespuesta(BaseModel):

    id: int
    usuario_id: int
    mascota_id: int
    nombre_mascota: Optional[str] = None
    imagen_mascota: Optional[str] = None
    solicitante: Optional[SolicitanteInfo] = None
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