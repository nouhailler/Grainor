# Changelog

Toutes les évolutions notables de Grainor sont consignées ici.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### À venir
- Écrans restants : Accueil, Récoltes, Noter une récolte, Inventaire, Calendrier
  (par mois + agenda annuel), Ajouter une graine (assistant IA OpenRouter), Paramètres.
- Export web (`expo export --platform web`) + déploiement Netlify de la PWA.

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

[Non publié]: https://github.com/nouhailler/Grainor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/nouhailler/Grainor/releases/tag/v0.1.0
