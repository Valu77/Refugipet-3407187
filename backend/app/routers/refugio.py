from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models import Mascota, Adopcion, Refugio, Usuario
from ..schemas import (
    MascotaCrear,
    MascotaActualizar,
    MascotaRespuesta,
    RefugioRespuesta,
    RefugioActualizarPerfil,
    RefugioCambiarPassword,
    AdopcionActualizar,
    DashboardRefugioRespuesta
)
from ..dependencies import get_current_refugio
from ..security import verify_password, hash_password


router = APIRouter(
    prefix="/refugio",
    tags=["Panel Refugio"]
)


# ==========================================
# DASHBOARD REFUGIO
# ==========================================

@router.get(
    "/dashboard",
    response_model=DashboardRefugioRespuesta
)
def obtener_dashboard_refugio(
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    # Métricas de mascotas del propio refugio
    total_mascotas = db.query(Mascota).filter(
        Mascota.refugio_id == refugio.id
    ).count()

    mascotas_disponibles = db.query(Mascota).filter(
        Mascota.refugio_id == refugio.id,
        Mascota.estado == "Disponible"
    ).count()

    mascotas_adoptadas = db.query(Mascota).filter(
        Mascota.refugio_id == refugio.id,
        Mascota.estado == "Adoptada"
    ).count()

    # Solicitudes de adopción de mascotas de este refugio
    consultas_adopciones = db.query(Adopcion).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).filter(
        Mascota.refugio_id == refugio.id
    )

    solicitudes_totales = consultas_adopciones.count()
    solicitudes_pendientes = consultas_adopciones.filter(
        Adopcion.estado == "Pendiente"
    ).count()

    return {
        "total_mascotas": total_mascotas,
        "mascotas_disponibles": mascotas_disponibles,
        "mascotas_adoptadas": mascotas_adoptadas,
        "solicitudes_pendientes": solicitudes_pendientes,
        "solicitudes_totales": solicitudes_totales
    }


# ==========================================
# MIS MASCOTAS (SOLO DEL REFUGIO AUTENTICADO)
# ==========================================

@router.get(
    "/mascotas",
    response_model=List[MascotaRespuesta]
)
def listar_mis_mascotas(
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    mascotas = db.query(Mascota).filter(
        Mascota.refugio_id == refugio.id
    ).order_by(Mascota.id.desc()).all()

    return mascotas


TIPOS_MASCOTA_PERMITIDOS = {"Perro", "Gato"}


def _normalizar_tipo_mascota(tipo: str) -> str:
    limpio = tipo.strip().capitalize()
    if limpio not in TIPOS_MASCOTA_PERMITIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten mascotas de tipo Perro o Gato."
        )
    return limpio


@router.post(
    "/mascotas",
    response_model=MascotaRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_mascota_refugio(
    datos: MascotaCrear,
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    tipo_normalizado = _normalizar_tipo_mascota(datos.tipo)

    nueva_mascota = Mascota(
        refugio_id=refugio.id,
        nombre=datos.nombre.strip(),
        tipo=tipo_normalizado,
        edad=datos.edad,
        tamaño="Pequeño" if datos.tamaño.strip().lower() == "pequeno" else datos.tamaño.strip(),
        descripcion=datos.descripcion.strip() if datos.descripcion else None,
        imagen=datos.imagen,
        estado="Disponible"
    )

    db.add(nueva_mascota)
    db.commit()
    db.refresh(nueva_mascota)
    nueva_mascota.nombre_refugio = refugio.nombre_refugio
    nueva_mascota.ciudad_refugio = refugio.ciudad

    return nueva_mascota


@router.put(
    "/mascotas/{mascota_id}",
    response_model=MascotaRespuesta
)
def actualizar_mascota_refugio(
    mascota_id: int,
    datos: MascotaActualizar,
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    mascota = db.query(Mascota).filter(
        Mascota.id == mascota_id,
        Mascota.refugio_id == refugio.id
    ).first()

    if not mascota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mascota no encontrada o no pertenece a tu refugio"
        )

    datos_actualizados = datos.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        if campo == "tipo" and isinstance(valor, str):
            # Conservar tipo antiguo si ya existía y no cambió; si se cambia, exigir Perro o Gato
            if valor.strip().lower() != (mascota.tipo or "").lower():
                valor = _normalizar_tipo_mascota(valor)
            else:
                valor = mascota.tipo
        elif campo == "tamaño" and isinstance(valor, str):
            valor = "Pequeño" if valor.strip().lower() == "pequeno" else valor.strip()
        elif isinstance(valor, str):
            valor = valor.strip()
        setattr(mascota, campo, valor)

    db.commit()
    db.refresh(mascota)
    mascota.nombre_refugio = refugio.nombre_refugio
    mascota.ciudad_refugio = refugio.ciudad

    return mascota


@router.delete(
    "/mascotas/{mascota_id}"
)
def retirar_mascota_refugio(
    mascota_id: int,
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    mascota = db.query(Mascota).filter(
        Mascota.id == mascota_id,
        Mascota.refugio_id == refugio.id
    ).first()

    if not mascota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mascota no encontrada o no pertenece a tu refugio"
        )

    # Si la mascota tiene solicitudes de adopción asociadas, cambiar a estado 'Retirada'
    # para no romper el historial de solicitudes de adopción de la base de datos
    tiene_solicitudes = db.query(Adopcion).filter(Adopcion.mascota_id == mascota.id).first()

    if tiene_solicitudes:
        mascota.estado = "Retirada"
        db.commit()
        return {
            "mensaje": "Mascota retirada de la lista pública conservando su historial de adopción."
        }

    # Si no tiene solicitudes vinculadas, se elimina limpiamente
    db.delete(mascota)
    db.commit()

    return {
        "mensaje": "Mascota eliminada correctamente."
    }


# ==========================================
# SOLICITUDES DE ADOPCIÓN DE MIS MASCOTAS
# ==========================================

@router.get(
    "/adopciones"
)
def listar_solicitudes_refugio(
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    solicitudes = db.query(
        Adopcion, Mascota, Usuario
    ).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).join(
        Usuario, Adopcion.usuario_id == Usuario.id
    ).filter(
        Mascota.refugio_id == refugio.id
    ).order_by(
        Adopcion.id.desc()
    ).all()

    resultado = []
    for adopcion, mascota, solicitante in solicitudes:
        resultado.append({
            "id": adopcion.id,
            "mascota_id": mascota.id,
            "nombre_mascota": mascota.nombre,
            "tipo_mascota": mascota.tipo,
            "edad_mascota": mascota.edad,
            "tamano_mascota": mascota.tamaño,
            "descripcion_mascota": mascota.descripcion,
            "imagen_mascota": mascota.imagen,
            "estado_mascota": mascota.estado,
            "solicitante": {
                "id": solicitante.id,
                "nombre": solicitante.nombre,
                "correo": solicitante.correo
            },
            "telefono": adopcion.telefono,
            "ciudad": adopcion.ciudad,
            "vivienda": adopcion.vivienda,
            "otras_mascotas": adopcion.otras_mascotas,
            "motivo": adopcion.motivo,
            "experiencia_mascotas": adopcion.experiencia_mascotas,
            "convivencia": adopcion.convivencia,
            "referencias": adopcion.referencias,
            "estado": adopcion.estado,
            "motivo_rechazo": adopcion.motivo_rechazo,
            "fecha": adopcion.fecha
        })

    return resultado


@router.put(
    "/adopciones/{adopcion_id}"
)
def responder_solicitud_adopcion(
    adopcion_id: int,
    datos: AdopcionActualizar,
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    adopcion = db.query(Adopcion).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).filter(
        Adopcion.id == adopcion_id,
        Mascota.refugio_id == refugio.id
    ).first()

    if not adopcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud de adopción no encontrada o no pertenece a tus mascotas"
        )

    estados_validos = ["Pendiente", "Aprobada", "Rechazada"]
    if datos.estado not in estados_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Debe ser uno de: {estados_validos}"
        )

    if adopcion.estado != "Pendiente" and datos.estado != adopcion.estado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta solicitud ya fue gestionada anteriormente."
        )

    # Si se aprueba la adopción, marcar la mascota como 'Adoptada'
    mascota = db.query(Mascota).filter(Mascota.id == adopcion.mascota_id).first()
    if datos.estado == "Aprobada":
        if mascota and mascota.estado == "Adoptada" and adopcion.estado != "Aprobada":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta mascota ya fue marcada como adoptada en otra solicitud."
            )
        if mascota:
            mascota.estado = "Adoptada"
        adopcion.motivo_rechazo = None
    elif datos.estado == "Rechazada":
        motivo = (datos.motivo_rechazo or "").strip()
        if len(motivo) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar un motivo de al menos 5 caracteres al rechazar la solicitud."
            )
        adopcion.motivo_rechazo = motivo

    adopcion.estado = datos.estado

    db.commit()
    db.refresh(adopcion)

    return {
        "mensaje": f"Solicitud de adopción actualizada a '{adopcion.estado}' correctamente.",
        "id": adopcion.id,
        "estado": adopcion.estado,
        "motivo_rechazo": adopcion.motivo_rechazo
    }


# ==========================================
# HISTORIAL DE ADOPCIONES
# ==========================================

@router.get(
    "/historial"
)
def obtener_historial_adopciones(
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    _, refugio = auth_data

    adopciones_aprobadas = db.query(
        Adopcion, Mascota, Usuario
    ).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).join(
        Usuario, Adopcion.usuario_id == Usuario.id
    ).filter(
        Mascota.refugio_id == refugio.id,
        Adopcion.estado == "Aprobada"
    ).order_by(
        Adopcion.fecha.desc()
    ).all()

    historial = []
    for adopcion, mascota, solicitante in adopciones_aprobadas:
        historial.append({
            "adopcion_id": adopcion.id,
            "mascota_id": mascota.id,
            "nombre_mascota": mascota.nombre,
            "tipo_mascota": mascota.tipo,
            "imagen_mascota": mascota.imagen,
            "adoptante_nombre": solicitante.nombre,
            "adoptante_correo": solicitante.correo,
            "telefono": adopcion.telefono,
            "ciudad": adopcion.ciudad,
            "fecha_adopcion": adopcion.fecha
        })

    return historial


# ==========================================
# PERFIL DEL REFUGIO
# ==========================================

@router.get(
    "/perfil",
    response_model=RefugioRespuesta
)
def obtener_perfil_refugio(
    auth_data = Depends(get_current_refugio)
):
    usuario, refugio = auth_data
    refugio.correo = usuario.correo
    return refugio


@router.put(
    "/perfil",
    response_model=RefugioRespuesta
)
def actualizar_perfil_refugio(
    datos: RefugioActualizarPerfil,
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    usuario, refugio = auth_data

    datos_actualizados = datos.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(refugio, campo, valor)

    # Si se actualiza el nombre del responsable, sincronizar el nombre del usuario
    if datos.nombre_responsable:
        usuario.nombre = datos.nombre_responsable.strip()

    db.commit()
    db.refresh(refugio)
    refugio.correo = usuario.correo

    return refugio


# ==========================================
# CAMBIAR CONTRASEÑA
# ==========================================

@router.put(
    "/cambiar-password"
)
def cambiar_password_refugio(
    datos: RefugioCambiarPassword,
    db: Session = Depends(get_db),
    auth_data = Depends(get_current_refugio)
):
    usuario, _ = auth_data

    # 1. Verificar contraseña actual con Argon2
    if not verify_password(datos.password_actual, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta."
        )

    # 2. Generar nuevo hash con Argon2id
    usuario.password = hash_password(datos.nueva_password)
    db.commit()

    return {
        "mensaje": "Contraseña actualizada exitosamente."
    }
