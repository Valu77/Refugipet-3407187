from fastapi import APIRouter

router = APIRouter(
    prefix="/mascotas",
    tags=["Mascotas"]
)

@router.get("/")
def listar_mascotas():
    return {"mensaje": "Lista de mascotas"}

@router.get("/{id}")
def obtener_mascota(id: int):
    return {"mensaje": f"Mascota {id}"}

@router.post("/")
def crear_mascota():
    return {"mensaje": "Mascota creada"}

@router.put("/{id}")
def actualizar_mascota(id: int):
    return {"mensaje": f"Mascota {id} actualizada"}

@router.delete("/{id}")
def eliminar_mascota(id: int):
    return {"mensaje": f"Mascota {id} eliminada"}