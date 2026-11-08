CREATE TABLE IF NOT EXISTS estabelecimentos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(120) NOT NULL,
    descricao   TEXT,
    categoria   VARCHAR(50) NOT NULL,
    localizacao GEOGRAPHY(POINT, 4326) NOT NULL,
    criado_em   TIMESTAMP NOT NULL DEFAULT now()
);

-- Índice para ST_DWithin (busca por raio), que usa geography
CREATE INDEX IF NOT EXISTS idx_estab_localizacao
    ON estabelecimentos USING GIST (localizacao);

-- Índice para ST_Intersects (área visível), que usa geometry
CREATE INDEX IF NOT EXISTS idx_estab_localizacao_geom
    ON estabelecimentos USING GIST ((localizacao::geometry));

-- Segurança: bloqueia acesso pela API pública do Supabase
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;