# CONTEXT — Grainor

Contexte d'architecture, de design et de décisions pour les contributeur·rice·s (humains ou
agents). La **source de vérité fonctionnelle et visuelle** reste le dossier
[`design_handoff_grainor/`](design_handoff_grainor/) :

- `README.md` — spécification produit, design et logique métier (numérotée §1–§9).
- `screenshots/` — 16 captures, le rendu pixel‑perfect visé.
- `design-reference/Grainor.dc.html` — prototype visuel + jeu de données de démo.

---

## 1. Vision

App de gestion des semences pour **maraîcher semi‑professionnel**. Dense, efficace, fiable,
**hors‑ligne par défaut**, **intégralement en français**. Quatre piliers : Classifier,
Entreposer, Planifier, Récupérer (cf. `README.md`).

---

## 2. Système de design (non négociable)

Centralisé dans [`GrainorApp/src/theme/tokens.ts`](GrainorApp/src/theme/tokens.ts). Aucune
valeur de couleur / typo / rayon ne doit être codée en dur dans un écran — tout passe par les
tokens.

**Couleurs clés** : `bg #EFE7D6`, `surface #FCFAF5`, `surfaceAlt #FBF7EE`, `primary #33503B`,
`text #2B271F`. Couleurs sémantiques (good/warn/alert/multiply), une couleur par **famille
botanique** (9) et par **cycle de vie** (annuelle/bisannuelle/vivace).

**Typographie** : Newsreader (serif) pour noms de variétés, titres et chiffres ; Hanken Grotesk
(sans) pour l'UI. Chargées via `@expo-google-fonts` dans `App.tsx`.

**Règles** :
- Icônes **outline** (trait 1.7–1.9), dessinées en SVG — **aucun emoji dans l'app**.
- Cartes : bordure fine, **jamais d'ombre portée** (le relief vient du fond clair).
- Rayons 12–18 px · cibles tactiles ≥ 44 px.
- Le **logo** = une « graine » (forme goutte `border-radius:52% 52% 52% 8px`, dégradé vert,
  inclinée −12°, point clair). Repris tel quel pour l'icône PWA (cf. `web/icons/icon.svg`).

---

## 3. Architecture de l'app

```
GrainorApp/src/
├── theme/tokens.ts      Tokens de design (couleurs, FAMS, CYCLE, STATUS, DIFF, fonts, radius…)
├── data/seeds.ts        Jeu de données de démo verbatim (11 variétés, 7 récoltes, 11 guides)
├── logic/seeds.ts       Logique métier pure → enrich(seed) renvoie un EnrichedSeed
├── store/AppContext.tsx État global (Provider + useApp) : seeds, harvests, photos, clé API
├── components/          Icon, ui (Pill/Card/TopBar/Logo/…), Gauge, ImageSearchModal
├── logic/ai.ts          Assistant IA OpenRouter (prompt, modèles, parsing JSON)
├── screens/             les 8 écrans (Accueil, Catalogue, Detail, Recoltes,
│                        NoterRecolte, Inventaire, Calendrier, Ajout, Parametres)
└── navigation/          RootNavigator (onglets + pile + FAB), types
```

- **État global** via React Context (`AppProvider` / `useApp`). Recalcul des variétés enrichies
  en `useMemo` à partir des données brutes.
- **Persistance** : `AsyncStorage` (photos par variété) ; `expo-secure-store` (clé API + modèle).
- **Rendu** suspendu tant que les polices **et** le store ne sont pas prêts (`App.tsx`).

---

## 4. Logique métier à reproduire (cf. `design_handoff_grainor/README.md` §6)

Implémentée dans `logic/seeds.ts`. Année/mois de référence figés (`CURRENT_YEAR = 2026`,
`CURRENT_MONTH = 6`) pour coller au jeu de démo.

- **§6.1 Viabilité** — `yearsStored = CURRENT_YEAR − recolteAnnee`.
  `> longMax` → *Hors durée* (semence périmée) · `≥ longMin` → *Dernière saison* (à semer en
  priorité) · sinon *Encore viable* (≈ N an(s) restants). Pourcentage de conservation borné.
- **§6.2 Germination mesurée** — `≥ 85 %` Bon · `≥ 70 %` Moyen · sinon Faible (avec couleurs).
- **§6.3 Alertes d'accueil** — variétés à surveiller (hors durée / stock faible / à semer).
- **§6.4 Remplissage de zone** — % par zone ; barre terracotta si > 85 %.
- **§6.5 Fenêtre de semis** — `inWin(mois, début, fin)` gère le cas où la fenêtre **traverse
  l'année** (début > fin).

---

## 5. Intégrations externes (§7)

- **§7.1 Wikimedia Commons** — `ImageSearchModal` interroge l'API publique (sans clé) ; filtre
  les MIME image ; propose un lien Google Images. L'image choisie est persistée localement.
- **§7.2 OpenRouter** — assistant IA pour pré‑remplir une fiche variété. Modèle `:free` par
  défaut (`meta-llama/llama-3.3-70b-instruct:free`). La réponse JSON est parsée, **présentée et
  validée par l'utilisateur** avant enregistrement.

### 🔐 Contrainte de sécurité (impérative)

> La clé API OpenRouter va dans le **stockage local sécurisé** (`expo-secure-store`),
> **JAMAIS en dur dans le code**, et **jamais committée**.

Clés de stockage : `grainor.openrouter.key`, `grainor.openrouter.model` (SecureStore) ;
`grainor.photos` (AsyncStorage).

---

## 6. PWA (dossier `web/`)

Grainor est aussi destiné à être installé en **PWA** (déploiement Netlify via `expo export
--platform web`). Le dossier `web/` fournit le manifest, les icônes (`any` + `maskable`,
favicons, apple‑touch) et un snippet `<head>`. Les icônes sont régénérables depuis les sources
SVG `web/icons/icon.svg` et `web/icons/icon-maskable.svg`. Voir le `README.md` racine.

---

## 7. Conventions

- **Français partout** (UI, commentaires, libellés).
- TypeScript strict ; `npx tsc --noEmit` doit rester vert.
- Tout nouvel écran réutilise les primitives `components/ui.tsx` et les tokens.
- `GrainorApp/AGENTS.md` rappelle de consulter la **doc Expo versionnée** (SDK 56) avant de coder.

---

## 8. État d'avancement

Voir [`CHANGELOG.md`](CHANGELOG.md). En bref : les **8 écrans + navigation** sont implémentés et
fidèles aux captures du handoff (Définition de « terminé » §9 couverte). Typecheck et build
Android verts. Reste surtout la persistance des variétés/récoltes ajoutées et le déploiement
PWA Netlify.
