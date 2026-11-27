-- ========================================================
-- ROLLBACK 003: REVERTIR TABLAS DE RECUPERACIÓN, FAVORITOS Y NOTIFICACIONES
-- ========================================================

DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
