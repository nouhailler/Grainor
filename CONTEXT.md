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
botanique** (9) et par **cycle de vie** (annuelle/bisannuelle/vivace). Les **familles
personnalisées** (créées à l'ajout ou proposées par l'IA hors des 9) sont autorisées et prennent
une **couleur neutre** (`#7A7363` via `FAMS[f] ?? défaut`).

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
  en `useMemo` à partir des données brutes. Méthodes : `addSeed`, `updateSeed`, `addHarvest`,
  `setPhoto`, `saveApiKey`, `exportData`, `importData`.
- **Persistance** (`AsyncStorage`) : variétés `grainor.seeds`, récoltes `grainor.harvests`,
  photos `grainor.photos` ; clé + modèle IA dans `expo-secure-store`
  (`grainor.openrouter.key/model`). Les ajouts/édition/import et récoltes survivent au redémarrage.
- **Import / export JSON** : `exportData()` (sauvegarde variétés + récoltes + photos),
  `importData()` (restauration complète **ou** ajout de variétés ; `normalizeSeed` complète les
  champs manquants). UI dans Paramètres.
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
- **§7.2 OpenRouter** (`logic/ai.ts`) — assistant IA pour pré‑remplir une fiche variété. Le prompt
  impose un JSON **complet** : classification, cycle, fenêtres semis/récolte (mois entiers),
  germination, profondeur/levée/espacement, et le **guide Récolte · Tri · Germination** (étapes).
  Tout est mappé dans la variété → fiche immédiatement exploitable. La proposition reste
  **validée par l'utilisateur** avant enregistrement (`askOpenRouter`, `parseAI`, `aiStepsToGuide`).
  Une fois la clé enregistrée, `fetchFreeModels(key)` charge la **liste live des modèles gratuits**
  (`GET /api/v1/models`, filtre `:free` / tarif nul) ; le choix est persisté. Repli : `AI_MODELS`.
  Déclenchable aussi depuis le **Catalogue** (recherche sans résultat → « créer avec l'IA »).

### 🔐 Contrainte de sécurité (impérative)

> La clé API OpenRouter va dans le **stockage local sécurisé** (`expo-secure-store`),
> **JAMAIS en dur dans le code**, et **jamais committée**.

Clés de stockage : `grainor.openrouter.key`, `grainor.openrouter.model` (SecureStore) ;
`grainor.photos` (AsyncStorage).

---

## 6. PWA (dossier `web/`)

Grainor tourne en **web** (`react-native-web`) et s'installe en **PWA**. Le dossier `web/` fournit
le manifest, les icônes (`any` + `maskable`, favicons, apple‑touch) et un snippet `<head>` (icônes
régénérables depuis `web/icons/icon.svg` / `icon-maskable.svg`).

Build/déploiement **clé en main** :
- `npm run build:web` (dans `GrainorApp/`) = `expo export --platform web` **+**
  `scripts/web-pwa.mjs dist` (injecte titre/langue + manifest + theme-color + apple‑touch, copie
  les icônes, écrit `_redirects`).
- [`netlify.toml`](netlify.toml) (racine) : `base = GrainorApp`, `command = npm ci && npm run
  build:web`, `publish = dist` (**relatif à `base`**). Déploiement auto à chaque push.

---

## 7. Conventions

- **Français partout** (UI, commentaires, libellés).
- TypeScript strict ; `npx tsc --noEmit` doit rester vert.
- Tout nouvel écran réutilise les primitives `components/ui.tsx` et les tokens.
- `GrainorApp/AGENTS.md` rappelle de consulter la **doc Expo versionnée** (SDK 56) avant de coder.

---

## 8. État d'avancement

Voir [`CHANGELOG.md`](CHANGELOG.md). En bref : les **8 écrans + navigation** sont implémentés et
fidèles aux captures du handoff (Définition de « terminé » §9 couverte). Persistance locale des
variétés/récoltes, import/export JSON, assistant IA (fiche complète + modèles gratuits live),
familles personnalisables, et build/déploiement web (PWA Netlify) en place. Typecheck et build
Android/web verts.

**Reprise (prochaine session)** — chantier principal : intégrer les **243 variétés du jardin**
listées en §9. Approche envisagée : génération des fiches par lots via l'assistant IA → relecture
→ chargement groupé par **import JSON** ; dédoublonner avec le jeu de démo ; trancher le périmètre
fruitiers/arbres/ornementales (hors potager). Pense aussi aux **captures d'écran** réelles
(`docs/screenshots/`) pour le README.

---

## 9. Backlog — variétés du jardin à intégrer

> **À traiter plus tard** (gros volume). Liste fournie par l'utilisateur (son jardin). Chaque
> entrée devra être enrichie en variété complète (classification botanique, cycle, fenêtres
> semis/récolte, durée de faculté germinative, profondeur/levée/espacement, guide Récolte · Tri ·
> Germination…), idéalement via l'assistant IA puis relecture. Certaines lignes sont des
> fruitiers / arbres / ornementales / oléagineux : à décider si on étend le périmètre « potager »
> ou si on crée des familles/catégories dédiées (le code couleur n'est défini que pour 9 familles
> potagères). Liste conservée **verbatim**, à dédoublonner au moment de l'intégration (ex. Carotte
> figure déjà dans le jeu de démo ; plusieurs variantes de Tomate/Courge/Chou/Laitue).

### Variétés (verbatim)

- [ ] Artichaut
- [ ] Asperge
- [ ] Aubergine
- [ ] Bette
- [ ] Betterave
- [ ] Brocoli
- [ ] Carotte
- [ ] Céleri branche
- [ ] Céleri rave
- [ ] Chou blanc
- [ ] Chou rouge
- [ ] Chou frisé
- [ ] Chou kale
- [ ] Chou chinois
- [ ] Chou-rave
- [ ] Chou de Bruxelles
- [ ] Chou Milan
- [ ] Chou pointu
- [ ] Chou cabus
- [ ] Chou palmier
- [ ] Concombre
- [ ] Cornichon
- [ ] Courge butternut
- [ ] Courge musquée
- [ ] Courge spaghetti
- [ ] Courge patidou
- [ ] Courgette
- [ ] Cresson
- [ ] Daikon
- [ ] Endive
- [ ] Épinard
- [ ] Fenouil
- [ ] Fève
- [ ] Flageolet
- [ ] Haricot vert
- [ ] Haricot beurre
- [ ] Haricot mungo
- [ ] Haricot azuki
- [ ] Laitue
- [ ] Laitue romaine
- [ ] Laitue batavia
- [ ] Laitue feuille de chêne
- [ ] Laitue iceberg
- [ ] Mâche
- [ ] Maïs doux
- [ ] Melon
- [ ] Mizuna
- [ ] Navet
- [ ] Oignon jaune
- [ ] Oignon rouge
- [ ] Oignon blanc
- [ ] Oignon cébette
- [ ] Pak choï
- [ ] Panais
- [ ] Patate douce
- [ ] Pâtisson
- [ ] Petit pois
- [ ] Piment
- [ ] Poireau
- [ ] Poivron
- [ ] Pomme de terre
- [ ] Pourpier
- [ ] Radis
- [ ] Radis noir
- [ ] Radis daikon
- [ ] Raifort
- [ ] Roquette
- [ ] Rutabaga
- [ ] Salsifis
- [ ] Scorsonère
- [ ] Topinambour
- [ ] Tomate
- [ ] Tomatillo
- [ ] Ail
- [ ] Échalote
- [ ] Gingembre
- [ ] Gombo
- [ ] Potiron
- [ ] Potimarron
- [ ] Pois chiche vert
- [ ] Pois mange-tout
- [ ] Pois cassé
- [ ] Rhubarbe
- [ ] Roquette sauvage
- [ ] Tétragone
- [ ] Tomate cerise
- [ ] Tomate prune
- [ ] Tomate noire
- [ ] Tomate jaune
- [ ] Tomate ananas
- [ ] Tomate raisin
- [ ] Tomate italienne
- [ ] Tomate verte
- [ ] Topinambour rouge
- [ ] Courge longue de Nice
- [ ] Courge delicata
- [ ] Courge kabocha
- [ ] Courge turban
- [ ] Courge Hubbard
- [ ] Courge acorn
- [ ] Courge buttercup
- [ ] Courgette trompette
- [ ] Oseille
- [ ] Persil tubéreux
- [ ] Piment doux
- [ ] Piment fort
- [ ] Quinoa feuille
- [ ] Radis pastèque
- [ ] Rave
- [ ] Souchet comestible
- [ ] Crosne du Japon
- [ ] Dolique asperge
- [ ] Épinard de Malabar
- [ ] Amarante feuille
- [ ] Arroche
- [ ] Cardon
- [ ] Chayote
- [ ] Chicorée frisée
- [ ] Chicorée scarole
- [ ] Chou pak choi
- [ ] Chou tatsoi
- [ ] Chou mizuna
- [ ] Chou komatsuna
- [ ] Courge galeuse
- [ ] Courge sucrine
- [ ] Chou vert
- [ ] Chou cavalier
- [ ] Chou sibérien
- [ ] Chou cabus précoce
- [ ] Chou cabus tardif
- [ ] Cerfeuil tubéreux
- [ ] Claytone de Cuba
- [ ] Margose
- [ ] Moutarde brune
- [ ] Okra
- [ ] Oignon rocambole
- [ ] Ortie potagère
- [ ] Oseille sanguine
- [ ] Pak choi nain
- [ ] Laitue asperge
- [ ] Haricot kilomètre
- [ ] Courge miniature
- [ ] Courge géante
- [ ] Courge verte d'Italie
- [ ] Zucchini
- [ ] Wasabi
- [ ] Catalonia
- [ ] Bardane
- [ ] Melon Charentais
- [ ] Melon Cantaloup
- [ ] Melon Galia
- [ ] Melon Honeydew
- [ ] Haricot grimpant
- [ ] Fraise
- [ ] Citrouille
- [ ] Asperge blanche
- [ ] Asperge violette
- [ ] Betterave jaune
- [ ] Betterave Chioggia
- [ ] Aubergine blanche
- [ ] Aubergine longue
- [ ] Carotte Nantaise
- [ ] Carotte Chantenay
- [ ] Carotte violette
- [ ] Concombre mini
- [ ] Concombre de serre
- [ ] Fraise remontante
- [ ] Navet boule d'or
- [ ] Navet de Milan
- [ ] Poivron rouge
- [ ] Poivron jaune
- [ ] Poivron corne
- [ ] Pomme de terre primeur
- [ ] Pomme de terre à chair ferme
- [ ] Pomme de terre vitelotte
- [ ] Basilic
- [ ] Persil plat
- [ ] Ciboulette
- [ ] Aneth
- [ ] Coriandre
- [ ] Estragon
- [ ] Mélisse
- [ ] Menthe
- [ ] Origan
- [ ] Romarin
- [ ] Sauge
- [ ] Sarriette
- [ ] Thym
- [ ] Cerfeuil
- [ ] Bourrache
- [ ] Livèche
- [ ] Marjolaine
- [ ] Laurier sauce
- [ ] Lentille verte
- [ ] Soja
- [ ] Lupin blanc
- [ ] Câprier
- [ ] Carvi
- [ ] Curcuma
- [ ] Pastèque
- [ ] Basilic thaï
- [ ] Basilic pourpre
- [ ] Basilic citron
- [ ] Blé tendre
- [ ] Blé dur
- [ ] Blé noir
- [ ] Épeautre
- [ ] Petit épeautre
- [ ] cerisier
- [ ] pommier
- [ ] poirier
- [ ] kaki
- [ ] kiwi
- [ ] vigne
- [ ] Mirabellier
- [ ] prunier
- [ ] noyer
- [ ] groseiller
- [ ] abricotier
- [ ] pêcher
- [ ] sésame
- [ ] syringa
- [ ] Viorne obier – Boule de neige
- [ ] rhododendron cosmopolitan
- [ ] ibéris
- [ ] Aubrieta
- [ ] Sedum album
- [ ] banane
- [ ] orange
- [ ] cacahuete
- [ ] pamplemousse
- [ ] amandier
- [ ] cajou
- [ ] Macadamia
- [ ] noix du brésil
- [ ] citronnier
- [ ] tournesol
- [ ] mandarine
- [ ] ananas
- [ ] fruit de la passion
- [ ] myrtille
- [ ] verveine citron
- [ ] groseillier à maquereau
