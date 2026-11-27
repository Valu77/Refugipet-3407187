from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import (
    Adopcion,
    Mascota,
    Usuario,
    Refugio
)

from ..schemas import (
    AdopcionCrear,
    AdopcionActualizar,
    AdopcionRespuesta,
    AdopcionConDetallesRespuesta
)

from ..dependencies import (
    get_current_user,
    get_current_admin
)
from ..services_notificaciones import crear_notificacion, notificar_admins


router = APIRouter(
    prefix="/adopciones",
    tags=["Adopciones"]
)


def _validar_mascota_disponible(mascota, db):
    if not mascota or mascota.estado == "Retirada":
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    if mascota.refugio_id is not None:
        refugio = db.query(Refugio).filter(
            Refugio.id == mascota.refugio_id
        ).first()

        if not refugio or refugio.estado != "aprobado":
            raise HTTPException(
                status_code=400,
                detail="Esta mascota no está disponible actualmente"
            )

    if mascota.estado != "Disponible":
        raise HTTPException(
            status_code=400,
            detail="Esta mascota no está disponible"
        )


def _validar_solicitud_existente(datos, usuario, db):
    solicitud_existente = db.query(Adopcion).filter(
        Adopcion.usuario_id == usuario.id,
        Adopcion.mascota_id == datos.mascota_id,
        Adopcion.estado == "Pendiente"
    ).first()

    if solicitud_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una solicitud pendiente para esta mascota"
        )


def _limpiar_campo_opcional(valor):
    return valor.strip() if valor else None


@router.post(
    "/",
    response_model=AdopcionRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear_adopcion(
    datos: AdopcionCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    mascota = db.query(Mascota).filter(
        Mascota.id == datos.mascota_id
    ).first()

    _validar_mascota_disponible(mascota, db)
    _validar_solicitud_existente(datos, usuario, db)

    adopcion = Adopcion(
        usuario_id=usuario.id,
        mascota_id=datos.mascota_id,
        telefono=datos.telefono.strip(),
        ciudad=datos.ciudad.strip(),
        vivienda=datos.vivienda.strip(),
        otras_mascotas=datos.otras_mascotas.strip(),
        motivo=datos.motivo.strip(),
        experiencia_mascotas=_limpiar_campo_opcional(
            datos.experiencia_mascotas
        ),
        convivencia=_limpiar_campo_opcional(datos.convivencia),
        referencias=_limpiar_campo_opcional(datos.referencias),
        estado="Pendiente"
    )

    db.add(adopcion)
    db.flush()

    if mascota.refugio_id and mascota.refugio:
        crear_notificacion(
            db=db,
            usuario_id=mascota.refugio.usuario_id,
            titulo=f"Nueva solicitud de adopción para {mascota.nombre}",
            mensaje=(
                f"{usuario.nombre} ({adopcion.ciudad}) envió una solicitud de adopción "
                f"para {mascota.nombre}."
            ),
            tipo="solicitud_adopcion",
            enlace="/refugio"
        )
    else:
        notificar_admins(
            db=db,
            titulo=f"Nueva solicitud de adopción para {mascota.nombre}",
            mensaje=(
                f"{usuario.nombre} ({adopcion.ciudad}) envió una solicitud de adopción "
                f"para {mascota.nombre}."
            ),
            tipo="solicitud_adopcion",
            enlace="/admin"
        )

    db.commit()
    db.refresh(adopcion)

    return adopcion


def _enriquecer_adopcion(
    adopcion: Adopcion,
    solicitante: Usuario,
    mascota: Mascota
) -> Adopcion:
    adopcion.usuario_nombre = getattr(solicitante, "nombre", None)
    adopcion.usuario_correo = getattr(solicitante, "correo", None)

    adopcion.mascota_nombre = getattr(mascota, "nombre", None)
    adopcion.mascota_tipo = getattr(mascota, "tipo", None)
    adopcion.mascota_imagen = getattr(mascota, "imagen", None)
    adopcion.mascota_edad = getattr(mascota, "edad", None)
    adopcion.mascota_tamano = getattr(mascota, "tamaño", None)
    adopcion.mascota_estado = getattr(mascota, "estado", None)

    adopcion.refugio_nombre = (
        mascota.refugio.nombre_refugio
        if mascota and mascota.refugio
        else "RefugiPet (General)"
    )

    return adopcion


@router.get(
    "/mis-solicitudes",
    response_model=List[AdopcionConDetallesRespuesta]
)
def obtener_mis_solicitudes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    filas = db.query(Adopcion, Mascota).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).filter(
        Adopcion.usuario_id == usuario.id
    ).order_by(
        Adopcion.id.desc()
    ).all()

    return [_enriquecer_adopcion(adopcion, usuario, mascota) for adopcion, mascota in filas]


@router.get(
    "/",
    response_model=List[AdopcionConDetallesRespuesta]
)
def obtener_adopciones(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    filas = db.query(
        Adopcion, Usuario, Mascota
    ).join(
        Usuario, Adopcion.usuario_id == Usuario.id
    ).join(
        Mascota, Adopcion.mascota_id == Mascota.id
    ).order_by(
        Adopcion.id.desc()
    ).all()

    return [
        _enriquecer_adopcion(adopcion, solicitante, mascota)
        for adopcion, solicitante, mascota in filas
    ]


@router.put(
    "/{adopcion_id}",
    response_model=AdopcionConDetallesRespuesta
)
def actualizar_adopcion(
    adopcion_id: int,
    datos: AdopcionActualizar,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    adopcion = db.query(
        Adopcion
    ).filter(
        Adopcion.id == adopcion_id
    ).first()

    if not adopcion:
        raise HTTPException(
            status_code=404,
            detail="Solicitud no encontrada"
        )

    estados_validos = [
        "Pendiente",
        "Aprobada",
        "Rechazada"
    ]

    if datos.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail="Estado inválido"
        )

    mascota = db.query(
        Mascota
    ).filter(
        Mascota.id == adopcion.mascota_id
    ).first()

    if datos.estado == "Aprobada":
        if mascota and mascota.estado == "Adoptada" and adopcion.estado != "Aprobada":
            raise HTTPException(
                status_code=400,
                detail="Esta mascota ya fue marcada como adoptada en otra solicitud."
            )
        if mascota:
            mascota.estado = "Adoptada"
        adopcion.motivo_rechazo = None
    elif datos.estado == "Rechazada" and datos.motivo_rechazo:
        adopcion.motivo_rechazo = datos.motivo_rechazo.strip()

    adopcion.estado = datos.estado

    if datos.estado in ("Aprobada", "Rechazada") and mascota:
        if datos.estado == "Aprobada":
            crear_notificacion(
                db=db,
                usuario_id=adopcion.usuario_id,
                titulo=f"¡Solicitud aprobada para {mascota.nombre}!",
                mensaje=(
                    f"Tu solicitud de adopción para {mascota.nombre} fue aprobada. "
                    "Pronto se comunicarán contigo para coordinar la entrega."
                ),
                tipo="adopcion_aprobada",
                enlace="/mis-solicitudes"
            )
        else:
            motivo_txt = f" Motivo: {adopcion.motivo_rechazo}" if adopcion.motivo_rechazo else ""
            crear_notificacion(
                db=db,
                usuario_id=adopcion.usuario_id,
                titulo=f"Actualización de solicitud para {mascota.nombre}",
                mensaje=(
                    f"Tu solicitud de adopción para {mascota.nombre} fue rechazada.{motivo_txt}"
                ),
                tipo="adopcion_rechazada",
                enlace="/mis-solicitudes"
            )

    db.commit()
    db.refresh(adopcion)

    return _enriquecer_adopcion(adopcion, adopcion.usuario, mascota)
