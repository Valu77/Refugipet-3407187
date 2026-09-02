from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import (
    Base,
    engine
)

from . import models

from .routers import (
    auth,
    mascotas,
    adopciones,
    contactos
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
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================
# ARCHIVOS ESTATICOS (IMAGENES DE MASCOTAS)
# ==========================================

app.mount(
    "/static",
    StaticFiles(directory="app/static"),
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

