# CartoPM — Roadmap & retours client

> Source : réunion Anthony ↔ Marwa Hamdi du 2026-06-10 (+ chat post-réu). Transcript archivé.

## Contexte
Marwa Hamdi (cliente, chercheuse process mining, encadrée par **Ronan**, La Rochelle) pilote le besoin. Le site était **down** (base Supabase supprimée) → **réparé le 2026-06-10**. Mise en place d'un environnement **prod/staging** + workflow de corrections.

## Tâches

### Features (allers-retours de l'été, sur `staging`)
1. **Réparer/valider le formulaire de saisie chercheur** — Ronan n'a pas réussi à remplir ses infos. Re-tester (base réparée) et corriger.
2. **Vue statique / dynamique** — onglet *statique* = chercheurs **internationaux** en lecture seule ; onglet *dynamique* = chercheurs **français** avec édition + formulaire. Recadre les tâches 1 et 3 (saisie limitée au périmètre FR).
3. **Champ « Enseignement / Cours »** — rubrique profil chercheur : *donne des cours de process mining ?* (webinaires, présentiel, cours). Concerne la vue dynamique FR.
4. **Formulaire feedback bug/suggestion** — comme PodWeb : nom auto si connecté + commentaire précis (section/page) → **notif Discord** vers Anthony qui lance la correction.

### Infra & gouvernance
5. **Transmettre les accès à Marwa** — admin site + Vercel + Supabase.
6. **Migration vers les serveurs de l'école** (Mines Albi, via **Seb / srebiere**) — horizon **septembre**. Pérennité + sortir des identifiants perso. Même démarche que PodWeb → IMT.

### Process
7. **Tester avec 3-4 chercheurs connus** — commencer petit, valider l'adéquation aux besoins.
8. **Envoyer le transcript à Marwa** (demandé, pas pressé).

## Roadmap
| Phase | Quoi |
|---|---|
| Temps 1 | Réparer le site ✅ (2026-06-10) |
| Été | Features 1→4 + allers-retours feedback + tests 3-4 chercheurs |
| En // | Préparer migration serveurs école (Seb) |
| Septembre | Site stabilisé sur serveurs école |

## Avancement 2026-06-10 (session dev)
Features **1, 2, 3, 4 livrées sur `staging`** (testées E2E), pas encore en prod :
- ✅ 1 — inscription chercheur + formulaire guidé de création (`/profile/new`) + validation admin (option 2 = création libre, validée par Marwa)
- ✅ 2 — onglets Communauté française / internationale (champ `origin`)
- ✅ 3 — champ Enseignement/Cours (`teaches` + `teaching_details`), affiché sur la fiche
- ✅ 4 — widget feedback Bug/Suggestion (`api/feedback.ts`) ; **reste** à brancher le webhook Discord (`DISCORD_FEEDBACK_WEBHOOK`)

Migrations `005` (teaching/origin) + `006` (feedback) appliquées sur staging. Email envoyé à Marwa (accès staging + transcript).
**À faire** : brancher webhook Discord, merger `staging`→`prod` après validation Marwa (+ décider confirmation email prod), accès prod à Marwa, migration serveurs école (sept), tests 3-4 chercheurs.
