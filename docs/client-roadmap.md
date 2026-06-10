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
