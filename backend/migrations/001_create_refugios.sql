-- ========================================================
-- MIGRACIÓN 001: SISTEMA DE GESTIÓN DE REFUGIOS
-- Proyecto: RefugiPet
-- Objetivo: Agregar la tabla de refugios y asociar mascotas a refugios
-- Compatibilidad: Totalmente compatible con datos preexistentes.
-- ========================================================

-- 1. Crear tabla de refugios
CREATE TABLE IF NOT EXISTS refugios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_refugio VARCHAR(150) NOT NULL,
    nombre_responsable VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    motivo_rechazo TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS ix_refugios_id ON refugios(id);
CREATE INDEX IF NOT EXISTS ix_refugios_usuario_id ON refugios(usuario_id);
CREATE INDEX IF NOT EXISTS ix_refugios_estado ON refugios(estado);

-- 2. Modificar tabla mascotas para vincularlas opcionalmente a un refugio
-- Al ser NULLABLE, las mascotas ya registradas permanecen intactas (mascotas generales)
ALTER TABLE mascotas
ADD COLUMN IF NOT EXISTS refugio_id INTEGER REFERENCES refugios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_mascotas_refugio_id ON mascotas(refugio_id);
