# Changelog

Toutes les évolutions notables de Grainor sont consignées ici.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté
- **Cible web (PWA)** — l'app tourne sous `react-native-web`. Script `scripts/web-pwa.mjs` +
  commande `npm run build:web` : export Expo web post‑traité (titre/langue, manifest,
  `theme-color`, apple‑touch‑icon, copie des icônes, fallback SPA `_redirects`).
- **`netlify.toml`** — déploiement Netlify automatique (base `GrainorApp`, publie `dist/`).
- **`app.json`** — config `web` (nom, langue, couleurs, `display: standalone`) ; nom de l'app
  passé à « Grainor ».

### À venir
- Captures d'écran prises sur appareil/navigateur (dossier `docs/screenshots/`).
- Persistance des variétés ajoutées et des récoltes saisies (actuellement en mémoire).

---

## [0.2.0] — 2026-06-16

Les **6 écrans restants** : l'app couvre désormais les 8 écrans + navigation du handoff (§9).

### Ajouté
- **Écran Accueil** (§4.1) — en‑tête logo, salutation, recherche‑raccourci, 4 tuiles de stats,
  carrousel « À semer ce mois‑ci », alertes « À surveiller » (§6.3), dernières récoltes.
- **Écran Récoltes** (§4.4) — bandeau de saison, filtre par statut, journal des récupérations.
- **Écran Noter une récolte** (§4.4) — variété, date, quantité, méthode d'extraction, statut,
  notes ; enregistrement dans le journal.
- **Écran Inventaire** (§4.5) — 5 zones d'entreposage avec barre de remplissage (terracotta
  au‑delà de 85 %) et variétés stockées.
- **Écran Calendrier** (§4.6) — bascule « Par mois » / « Agenda annuel » ; agenda = 1 ligne par
  variété × 12 mois, mini‑barres semis (couleur famille) + récolte (brun), mois courant surligné.
- **Écran Ajouter une graine** (§4.7) — assistant IA OpenRouter (proposition JSON validée par
  l'utilisateur avant remplissage), zone de scan d'étiquette, formulaire manuel complet.
- **Écran Paramètres** (§4.8) — saisie de la clé OpenRouter (champ masqué, stockage local
  sécurisé), choix du modèle gratuit, bloc « À propos » hors‑ligne.
- **Module IA** (`src/logic/ai.ts`) — prompt système, liste des modèles `:free`, appel OpenRouter
  et parsing tolérant du JSON.
- Composants partagés `TopBar` et `Logo`, icônes `check` / `chevron`.
- Gallerie de captures de tous les écrans dans le `README`.

### Modifié
- `enrich()` applique un **guide par défaut** si une variété ajoutée n'a pas de fiche de
  récupération détaillée (les variétés ajoutées conservent leur identifiant réel).

### Vérifié
- `npx tsc --noEmit` — sans erreur.
- `npx expo export --platform android` — bundle généré avec succès.

---

## [0.1.0] — 2026-06-16

Première brique : socle technique + design, et les deux écrans les plus structurants.

### Ajouté
- **Socle de design** — tokens centralisés (`src/theme/tokens.ts`) : couleurs, familles
  botaniques, cycles de vie, statuts, difficulté, typographies, rayons, espacements.
- **Polices** — chargement de Newsreader (serif) et Hanken Grotesk (sans) via
  `@expo-google-fonts` ; rendu suspendu tant que polices + store ne sont pas prêts.
- **Navigation** — barre d'onglets personnalisée (5 onglets), bouton **＋** flottant (masqué
  hors onglets), pile native (Fiche détail, Ajout, Noter une récolte, Paramètres).
- **Données de démo** — 11 variétés, 7 récoltes et 11 guides de récupération (`src/data/seeds.ts`).
- **Logique métier** (`src/logic/seeds.ts`) — viabilité, germination mesurée, fenêtre de semis
  pouvant traverser l'année, remplissage de zone.
- **État global** (`src/store/AppContext.tsx`) — offline‑first ; photos en AsyncStorage ;
  clé API OpenRouter + modèle en stockage local sécurisé (`expo-secure-store`).
- **Écran Catalogue** — recherche, filtres par famille botanique, liste des variétés.
- **Écran Fiche détail** — hero, viabilité, jauge de germination (anneau SVG), carte de
  conservation, fenêtre de semis, classification botanique, guide de récupération (onglets
  récolte/tri/germination), historique des récoltes.
- **Composants** — jeu d'icônes outline en SVG, primitives UI (Pill, Card, …), jauge de
  germination, modale de recherche d'image (Wikimedia Commons + lien Google Images).
- **Identité PWA** — icône « graine » dérivée du logo de la marque, déclinée en jeu complet
  (`web/icons/` : `any` + `maskable`, apple‑touch, favicons) + `manifest.webmanifest` et
  snippet `<head>` pour un déploiement Netlify.
- **Documentation** — `README.md`, `CONTEXT.md`, `CHANGELOG.md`.

### Sécurité
- La clé API OpenRouter n'est **jamais** écrite en dur ni committée : saisie dans les Paramètres,
  conservée dans le stockage local sécurisé de l'appareil.

### Vérifié
- `npx tsc --noEmit` — sans erreur.
- `npx expo export --platform android` — bundle généré avec succès.

[Non publié]: https://github.com/nouhailler/Grainor/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/nouhailler/Grainor/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nouhailler/Grainor/releases/tag/v0.1.0
