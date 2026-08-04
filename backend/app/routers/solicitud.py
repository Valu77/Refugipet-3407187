from fastapi import APIRouter

router = APIRouter(
    prefix="/solicitudes",
    tags=["Solicitudes"]
)

@router.get("/")
def listar_solicitudes():
    return {"mensaje": "Lista de solicitudes"}

@router.get("/{id}")
def obtener_solicitud(id: int):
    return {"mensaje": f"Solicitud {id}"}

@router.post("/")
def crear_solicitud():
    return {"mensaje": "Solicitud creada"}

@router.put("/{id}")
def actualizar_solicitud(id: int):
    return {"mensaje": f"Solicitud {id} actualizada"}

@router.delete("/{id}")
def eliminar_solicitud(id: int):
    return {"mensaje": f"Solicitud {id} eliminada"}