-- ========================================================
-- ROLLBACK 001: REVERTIR SISTEMA DE GESTIÓN DE REFUGIOS
-- Proyecto: RefugiPet
-- Objetivo: Revertir de forma segura la migración 001 si fuera necesario.
-- ========================================================

-- 1. Eliminar la clave foránea e índice en mascotas
DROP INDEX IF EXISTS ix_mascotas_refugio_id;
ALTER TABLE mascotas DROP COLUMN IF EXISTS refugio_id;

-- 2. Eliminar índices y tabla refugios
DROP INDEX IF EXISTS ix_refugios_estado;
DROP INDEX IF EXISTS ix_refugios_usuario_id;
DROP INDEX IF EXISTS ix_refugios_id;
DROP TABLE IF EXISTS refugios CASCADE;
