-- ========================================================
-- MIGRACIÓN 003: RECUPERACIÓN DE CONTRASEÑA, FAVORITOS Y NOTIFICACIONES
-- Proyecto: RefugiPet
-- Compatibilidad: Tablas nuevas IF NOT EXISTS, 100% no destructiva.
-- ========================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_usuario_id ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mascota_id INTEGER NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favoritos_usuario_mascota UNIQUE (usuario_id, mascota_id)
);

CREATE INDEX IF NOT EXISTS ix_favoritos_usuario_id ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS ix_favoritos_mascota_id ON favoritos(mascota_id);

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(40) NOT NULL DEFAULT 'info',
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    enlace VARCHAR(200),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS ix_notificaciones_leida ON notificaciones(leida);
