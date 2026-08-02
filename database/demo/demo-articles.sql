-- Articles de démonstration — contenu FICTIF, uniquement pour visualiser le
-- rendu du site avant de brancher le vrai pipeline (clé API + crédit).
--
-- Ce fichier n'est PAS exécuté automatiquement au démarrage (il vit hors de
-- database/*.sql, qui est le seul niveau lu par docker-entrypoint-initdb.d).
-- À appliquer manuellement sur le VPS, une fois le dépôt à jour :
--
--   docker compose exec -T db psql -U agent_veille -d agent_veille \
--     < database/demo/demo-articles.sql
--
-- Pour tout retirer avant la mise en production réelle :
--
--   docker compose exec -T db psql -U agent_veille -d agent_veille \
--     -c "DELETE FROM articles WHERE meta_seo->>'demo' = 'true';"

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Faille critique chez un fournisseur cloud majeur : ce que révèle l''ampleur de l''incident',
  'demo-faille-cloud-fournisseur-majeur',
  'Trois sources concordantes, croisées avec les avis officiels de plusieurs CERT nationaux, dessinent une chronologie plus large que celle communiquée initialement par l''hébergeur.',
  $$Un incident de sécurité affectant un grand fournisseur d'infrastructure cloud a été révélé cette semaine, avec un périmètre plus large que ce que les premières communications officielles laissaient entendre.

## Ce que l'on sait

Plusieurs équipes de réponse aux incidents ont publié des avis convergents sur la nature de la faille et les services concernés. Le recoupement de ces avis avec les communications de l'hébergeur fait apparaître un écart de plusieurs heures entre la détection interne et la notification publique.

## Pourquoi ça compte

Les entreprises clientes de ce type d'infrastructure doivent désormais évaluer leur propre exposition, en particulier si leurs services critiques dépendent de la brique concernée.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}, {"url": "#", "titre": "Second exemple de source"}]'::jsonb,
  'reactif', 'publie', 0.86,
  '{"demo": "true", "titre_seo": "Faille cloud majeure : ce que révèle l''ampleur de l''incident", "description": "Chronologie reconstituée à partir de plusieurs sources.", "mots_cles": ["cybersécurité", "cloud", "incident"]}'::jsonb,
  now() - interval '3 hours'
FROM domaines WHERE slug = 'numerique'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Les navigateurs accélèrent l''adoption des passkeys : où en est réellement le remplacement du mot de passe',
  'demo-adoption-passkeys-navigateurs',
  'Le support technique progresse plus vite que l''usage réel. Panorama de ce qui bloque encore l''adoption à grande échelle.',
  $$L'adoption des passkeys progresse chez les grands éditeurs de navigateurs et de systèmes d'exploitation, mais l'usage effectif par le grand public reste en retrait par rapport à la disponibilité technique.

## Le décalage entre disponibilité et usage

La plupart des grandes plateformes proposent désormais cette méthode d'authentification, mais la migration des comptes existants reste largement optionnelle et peu mise en avant.

## Ce qui pourrait accélérer les choses

Plusieurs services envisagent de rendre les passkeys obligatoires pour les nouveaux comptes, ce qui pourrait changer la donne dans les prochains mois.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}]'::jsonb,
  'quotidien', 'publie', 0.81,
  '{"demo": "true", "titre_seo": "Passkeys : où en est l''adoption réelle", "description": "Panorama de l''adoption des passkeys.", "mots_cles": ["authentification", "passkeys", "sécurité"]}'::jsonb,
  now() - interval '1 day 4 hours'
FROM domaines WHERE slug = 'numerique'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Séries A en baisse de 18 % en Europe : les investisseurs resserrent leurs critères',
  'demo-series-a-baisse-europe',
  'Moins de tours de table, mais des montants moyens stables. Ce que ça dit du marché du capital-risque cette année.',
  $$Le nombre de levées de fonds en série A a reculé en Europe, selon plusieurs panoramas sectoriels publiés cette semaine, tandis que les montants moyens par opération restent globalement stables.

## Une sélectivité accrue

Les investisseurs indiquent porter une attention plus grande à la rentabilité projetée et aux marges, plutôt qu'à la seule croissance des utilisateurs.

## Des disparités sectorielles

Certains secteurs, notamment liés à l'infrastructure logicielle d'entreprise, semblent moins affectés que la moyenne.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}, {"url": "#", "titre": "Second exemple de source"}]'::jsonb,
  'quotidien', 'publie', 0.79,
  '{"demo": "true", "titre_seo": "Séries A en baisse de 18 % en Europe", "description": "Ce que dit le ralentissement des levées de fonds du marché du capital-risque.", "mots_cles": ["startup", "levée de fonds", "capital-risque"]}'::jsonb,
  now() - interval '2 days'
FROM domaines WHERE slug = 'ecosysteme'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Pourquoi la banque centrale temporise malgré le ralentissement de l''inflation',
  'demo-banque-centrale-temporise-inflation',
  'Les derniers chiffres montrent un ralentissement net, mais les responsables monétaires évoquent des risques encore mal quantifiés.',
  $$Malgré un ralentissement de l'inflation confirmé par les derniers indices publiés, les responsables de politique monétaire ont maintenu un ton prudent lors de leurs dernières interventions publiques.

## Les arguments de la prudence

Plusieurs risques sont cités pour justifier l'attentisme, notamment l'incertitude sur la trajectoire des salaires et sur les prix de l'énergie à moyen terme.

## Ce que ça change pour les mois à venir

Les marchés ajustent leurs anticipations en conséquence, avec des scénarios de taux qui divergent sensiblement d'un établissement financier à l'autre.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}]'::jsonb,
  'quotidien', 'publie', 0.83,
  '{"demo": "true", "titre_seo": "Pourquoi la banque centrale temporise", "description": "Ce que cache la prudence monétaire malgré le ralentissement de l''inflation.", "mots_cles": ["inflation", "banque centrale", "politique monétaire"]}'::jsonb,
  now() - interval '9 hours'
FROM domaines WHERE slug = 'economie'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Résultats trimestriels : pourquoi les marges surprennent plus que le chiffre d''affaires cette saison',
  'demo-resultats-trimestriels-marges',
  'La tendance de la saison : des revenus globalement conformes aux attentes, mais des marges qui divergent fortement selon les secteurs.',
  $$La saison des résultats trimestriels fait ressortir un motif récurrent : les chiffres d'affaires publiés collent largement aux prévisions des analystes, mais les marges opérationnelles créent l'essentiel des surprises, dans un sens comme dans l'autre.

## Les secteurs qui tirent leur épingle du jeu

Certains secteurs bénéficient d'une meilleure maîtrise des coûts fixes, ce qui se traduit directement dans les marges publiées.

## Les points de vigilance

Les analystes surveillent particulièrement l'évolution des stocks et les provisions, souvent révélatrices de tensions à venir.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}]'::jsonb,
  'quotidien', 'publie', 0.77,
  '{"demo": "true", "titre_seo": "Résultats trimestriels : les marges surprennent", "description": "Ce que révèlent les marges de la saison des résultats.", "mots_cles": ["résultats", "entreprises", "marges"]}'::jsonb,
  now() - interval '3 days'
FROM domaines WHERE slug = 'economie'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Mer de Chine méridionale : ce que révèlent les manœuvres navales de la semaine',
  'demo-mer-chine-meridionale-manoeuvres',
  'Un point de tension à suivre, expliqué sans jargon diplomatique, à partir des communications officielles et des observations satellites publiques.',
  $$Plusieurs marines ont mené des exercices dans une zone disputée de la mer de Chine méridionale cette semaine, relançant les tensions dans une région déjà sous surveillance internationale constante.

## Ce qui s'est passé concrètement

Les communications officielles des parties concernées divergent sur l'interprétation des événements, ce qui complique la lecture pour les observateurs extérieurs.

## Les enjeux de fond

Au-delà de l'épisode ponctuel, la zone reste stratégique pour les routes commerciales maritimes et les ressources sous-marines qu'elle recèle.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}, {"url": "#", "titre": "Second exemple de source"}, {"url": "#", "titre": "Troisième exemple de source"}]'::jsonb,
  'reactif', 'publie', 0.84,
  '{"demo": "true", "titre_seo": "Mer de Chine méridionale : ce que révèlent les manœuvres navales", "description": "Point de tension expliqué à partir de sources publiques.", "mots_cles": ["géopolitique", "mer de Chine", "diplomatie"]}'::jsonb,
  now() - interval '7 hours'
FROM domaines WHERE slug = 'geopolitique'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Sommet énergétique : ce qui a été acté, ce qui reste flou',
  'demo-sommet-energetique-bilan',
  'Un accord de principe a été annoncé, mais plusieurs points de mise en œuvre restent renvoyés à des négociations ultérieures.',
  $$Un sommet consacré à la coopération énergétique régionale s'est conclu sur un accord de principe, dont plusieurs modalités concrètes restent encore à préciser dans les mois à venir.

## Les points actés

Les participants se sont accordés sur des objectifs communs de diversification des approvisionnements, sans calendrier contraignant précis.

## Les zones d'ombre

Le financement des infrastructures nécessaires à ces objectifs reste le principal point de désaccord entre les parties.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}]'::jsonb,
  'quotidien', 'publie', 0.78,
  '{"demo": "true", "titre_seo": "Sommet énergétique : ce qui a été acté", "description": "Bilan d''un sommet énergétique régional.", "mots_cles": ["énergie", "diplomatie", "sommet"]}'::jsonb,
  now() - interval '2 days 5 hours'
FROM domaines WHERE slug = 'geopolitique'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'L''UE resserre l''encadrement des modèles à usage général : ce que change le nouveau règlement d''application',
  'demo-ue-encadrement-modeles-usage-general',
  'Trois sources croisées, dont le texte réglementaire lui-même, permettent de distinguer ce qui change concrètement de ce qui reste inchangé.',
  $$Un nouveau texte d'application est venu préciser les obligations applicables aux fournisseurs de modèles d'intelligence artificielle à usage général, avec des échéances de mise en conformité étalées sur plusieurs mois.

## Ce qui change concrètement

Les obligations de documentation technique et de transparence sur les données d'entraînement sont renforcées pour les modèles dépassant certains seuils de capacité.

## Ce qui reste flou

L'articulation avec les régimes déjà existants dans d'autres juridictions n'est pas encore totalement clarifiée, ce qui laisse une marge d'interprétation aux acteurs concernés.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}, {"url": "#", "titre": "Second exemple de source"}]'::jsonb,
  'reactif', 'publie', 0.88,
  '{"demo": "true", "titre_seo": "L''UE resserre l''encadrement des modèles à usage général", "description": "Ce que change le nouveau règlement d''application.", "mots_cles": ["IA", "régulation", "Union européenne"]}'::jsonb,
  now() - interval '5 hours'
FROM domaines WHERE slug = 'intelligence-artificielle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (domaine_id, titre, slug, extrait, corps, sources, type_cycle, statut, score_confiance, meta_seo, publie_le)
SELECT id,
  'Les agents autonomes en entreprise : entre gains de productivité et zones d''ombre juridiques',
  'demo-agents-autonomes-entreprise',
  'Productivité réelle sur des tâches ciblées, mais des questions de responsabilité encore sans réponse claire en cas d''erreur.',
  $$L'adoption d'agents autonomes dans les processus d'entreprise progresse rapidement sur des tâches bien délimitées, tandis que les questions de responsabilité juridique en cas de décision erronée restent largement non tranchées.

## Où les gains sont les plus nets

Les tâches répétitives et bien documentées, comme le traitement de premier niveau des demandes clients, montrent les gains de productivité les plus mesurables.

## Ce qui freine une adoption plus large

L'absence de cadre clair sur la responsabilité en cas de préjudice causé par une décision d'agent autonome pousse de nombreuses entreprises à garder un contrôle humain sur les décisions à enjeu.

*Ceci est un article de démonstration généré pour prévisualiser la mise en page — le contenu n'est pas une information vérifiée.*$$,
  '[{"url": "#", "titre": "Exemple de source (contenu de démonstration)"}]'::jsonb,
  'quotidien', 'publie', 0.8,
  '{"demo": "true", "titre_seo": "Agents autonomes en entreprise : productivité et zones d''ombre", "description": "Ce que change l''adoption d''agents autonomes en entreprise.", "mots_cles": ["IA", "agents autonomes", "entreprise"]}'::jsonb,
  now() - interval '1 day 10 hours'
FROM domaines WHERE slug = 'intelligence-artificielle'
ON CONFLICT (slug) DO NOTHING;
