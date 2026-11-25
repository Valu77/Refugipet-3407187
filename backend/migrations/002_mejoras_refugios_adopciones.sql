-- ========================================================
-- MIGRACIÓN 002: MEJORAS DE SOLICITUDES Y SUSPENSIÓN DE REFUGIOS
-- Proyecto: RefugiPet
-- Objetivo: Agregar motivo de suspensión en refugios y campos de
--           evaluación/motivo de rechazo en adopciones.
-- Compatibilidad: Columnas NULLABLE, 100% compatible con datos existentes.
-- ========================================================

ALTER TABLE refugios
ADD COLUMN IF NOT EXISTS motivo_suspension TEXT;

ALTER TABLE adopciones
ADD COLUMN IF NOT EXISTS experiencia_mascotas TEXT,
ADD COLUMN IF NOT EXISTS convivencia VARCHAR(200),
ADD COLUMN IF NOT EXISTS referencias TEXT,
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
