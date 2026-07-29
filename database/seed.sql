-- Amorçage des 5 domaines de départ (cahier des charges, section 3)
INSERT INTO domaines (slug, nom, description, mots_cles, angle_editorial, ton, actif)
VALUES
    ('numerique', 'Numérique', 'Tech, produits, plateformes, cybersécurité',
        ARRAY['technologie', 'cybersécurité', 'plateformes', 'produits tech'], NULL, NULL, true),
    ('ecosysteme', 'Écosystème', 'Entrepreneuriat, startups, innovation',
        ARRAY['startup', 'levée de fonds', 'entrepreneuriat', 'innovation'], NULL, NULL, true),
    ('economie', 'Économie', 'Marchés, entreprises, politique monétaire',
        ARRAY['marchés', 'inflation', 'banque centrale', 'entreprises'], NULL, NULL, true),
    ('geopolitique', 'Géopolitique', 'Conflits, diplomatie, rapports de force internationaux',
        ARRAY['conflit', 'diplomatie', 'relations internationales'], NULL, NULL, true),
    ('intelligence-artificielle', 'Intelligence artificielle', 'Modèles, régulation, usages de l''IA',
        ARRAY['IA', 'modèle de langage', 'régulation IA', 'usage IA'], NULL, NULL, true)
ON CONFLICT (slug) DO NOTHING;
