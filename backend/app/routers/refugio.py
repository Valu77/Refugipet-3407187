from fastapi import APIRouter

router = APIRouter(
    prefix="/refugios",
    tags=["Refugios"]
)

@router.get("/")
def listar_refugios():
    return {"mensaje": "Lista de refugios"}

@router.get("/{id}")
def obtener_refugio(id: int):
    return {"mensaje": f"Refugio {id}"}

@router.post("/")
def crear_refugio():
    return {"mensaje": "Refugio creado"}

@router.put("/{id}")
def actualizar_refugio(id: int):
    return {"mensaje": f"Refugio {id} actualizado"}

@router.delete("/{id}")
def eliminar_refugio(id: int):
    return {"mensaje": f"Refugio {id} eliminado"}