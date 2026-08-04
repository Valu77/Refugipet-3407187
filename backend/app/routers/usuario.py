from fastapi import APIRouter

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router.get("/")
def listar_usuarios():
    return {"mensaje": "Lista de usuarios"}

@router.get("/{id}")
def obtener_usuario(id: int):
    return {"mensaje": f"Usuario {id}"}

@router.post("/")
def crear_usuario():
    return {"mensaje": "Usuario creado"}

@router.put("/{id}")
def actualizar_usuario(id: int):
    return {"mensaje": f"Usuario {id} actualizado"}

@router.delete("/{id}")
def eliminar_usuario(id: int):
    return {"mensaje": f"Usuario {id} eliminado"}