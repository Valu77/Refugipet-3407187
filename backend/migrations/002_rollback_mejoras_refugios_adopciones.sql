-- ========================================================
-- ROLLBACK 002: REVERTIR COLUMNAS DE MEJORAS EN ADOPCIONES Y REFUGIOS
-- ========================================================

ALTER TABLE adopciones
DROP COLUMN IF EXISTS motivo_rechazo,
DROP COLUMN IF EXISTS referencias,
DROP COLUMN IF EXISTS convivencia,
DROP COLUMN IF EXISTS experiencia_mascotas;

ALTER TABLE refugios
DROP COLUMN IF EXISTS motivo_suspension;
