-- Schéma de départ — Agent de veille et analyse éditoriale
-- Tables : domaines, sujets_traites, articles

CREATE TABLE IF NOT EXISTS domaines (
    id                      SERIAL PRIMARY KEY,
    slug                    VARCHAR(50) UNIQUE NOT NULL,
    nom                     VARCHAR(100) NOT NULL,
    description             TEXT,
    mots_cles               TEXT[] NOT NULL DEFAULT '{}',
    sources_privilegiees    JSONB NOT NULL DEFAULT '[]',
    angle_editorial         TEXT,
    ton                     VARCHAR(100),
    actif                   BOOLEAN NOT NULL DEFAULT true,
    heure_cycle_quotidien   TIME,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sujets_traites (
    id              SERIAL PRIMARY KEY,
    domaine_id      INTEGER NOT NULL REFERENCES domaines(id) ON DELETE CASCADE,
    sujet           TEXT NOT NULL,
    resume          TEXT,
    score           NUMERIC,
    type_cycle      VARCHAR(20) NOT NULL CHECK (type_cycle IN ('quotidien', 'reactif')),
    statut          VARCHAR(20) NOT NULL DEFAULT 'candidat' CHECK (statut IN ('candidat', 'retenu', 'rejete')),
    source_urls     JSONB NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sujets_traites_domaine ON sujets_traites(domaine_id, created_at DESC);

CREATE TABLE IF NOT EXISTS articles (
    id                  SERIAL PRIMARY KEY,
    domaine_id          INTEGER NOT NULL REFERENCES domaines(id) ON DELETE CASCADE,
    sujet_traite_id     INTEGER REFERENCES sujets_traites(id) ON DELETE SET NULL,
    titre               TEXT NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    extrait             TEXT,
    corps               TEXT NOT NULL,
    sources             JSONB NOT NULL DEFAULT '[]',
    type_cycle          VARCHAR(20) NOT NULL CHECK (type_cycle IN ('quotidien', 'reactif')),
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'verifie', 'publie', 'annule')),
    score_confiance     NUMERIC,
    raison_annulation   TEXT,
    meta_seo            JSONB NOT NULL DEFAULT '{}',
    publie_le           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_domaine_statut ON articles(domaine_id, statut);
CREATE INDEX IF NOT EXISTS idx_articles_publie_le ON articles(publie_le DESC);
