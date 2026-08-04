from pydantic import BaseModel, EmailStr

class Login(BaseModel):
    correo: EmailStr
    contraseña: str

class Token(BaseModel):
    access_token: str
    token_type: str