from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)

@router.post("/login")
def login():
    return {"mensaje": "Inicio de sesión exitoso"}

@router.post("/register")
def register():
    return {"mensaje": "Usuario registrado"}