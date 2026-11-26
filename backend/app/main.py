import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import (
    Base,
    engine
)

from . import models  # noqa: F401

from .routers import (
    auth,
    mascotas,
    adopciones,
    contactos,
    refugio,
    admin_refugios
)


# ==========================================
# CREAR TABLAS
# ==========================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================
# CREAR APLICACIÓN
# ==========================================

app = FastAPI(
    title="API RefugiPet",
    description="Backend para la plataforma RefugiPet",
    version="1.0.0"
)


# ==========================================
# CORS
# CONEXIÓN CON REACT
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================
# ARCHIVOS ESTATICOS (IMAGENES DE MASCOTAS)
# ==========================================

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "mascotas"), exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static"
)


# ==========================================
# RUTA PRINCIPAL
# ==========================================

@app.get("/")
def inicio():

    return {
        "mensaje": "🐾 API de RefugiPet funcionando correctamente"
    }


# ==========================================
# RUTAS
# ==========================================

app.include_router(
    auth.router,
    prefix="/api"
)

app.include_router(
    mascotas.router,
    prefix="/api"
)
app.include_router(
    adopciones.router,
    prefix="/api"
)
app.include_router(
    contactos.router,
    prefix="/api"
)

app.include_router(
    refugio.router,
    prefix="/api"
)

app.include_router(
    admin_refugios.router,
    prefix="/api"
)
