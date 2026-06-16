# Prompt pour Claude Code — Implémentation de Grainor

Copiez‑collez le bloc ci‑dessous dans Claude Code, **à la racine de ce dossier de handoff**
(pour qu'il ait accès au README, aux captures et au fichier de référence).

---

## 📋 Prompt à coller

````
Tu vas implémenter **Grainor**, une application mobile Android de gestion de semences pour
maraîchers semi‑professionnels. Tout le matériel de design est dans ce dossier.

AVANT DE CODER, lis dans cet ordre :
1. `README.md` — la spécification complète (système de design, écrans, modèle de données,
   logique métier, intégrations). C'est ta référence principale.
2. `screenshots/` — les 16 captures haute résolution du rendu cible. Numérotées par écran.
3. `design-reference/Grainor.dc.html` — le prototype HTML fonctionnel : c'est la SOURCE DE VÉRITÉ
   visuelle. Ouvre‑le et inspecte les éléments pour récupérer les valeurs exactes (couleurs,
   espacements, tailles) et surtout le JEU DE DONNÉES de démonstration (11 variétés + 7 récoltes
   + 5 zones + les guides de récupération espèce par espèce) et le prompt système de l'assistant IA.

CONTRAINTES DE DESIGN (non négociables — voir README §2) :
- Palette naturelle : fond crème #EFE7D6, cartes #FCFAF5, primaire vert forêt #33503B, texte #2B271F.
- Typo : Newsreader (serif) pour noms de variétés / titres / chiffres ; Hanken Grotesk (sans) pour l'UI.
- Code couleur par FAMILLE BOTANIQUE (pastilles) et par CYCLE de vie — repères visuels centraux.
- Icônes outline, pas d'emoji. Cartes sans ombre portée (fond clair + bordure fine). Rayons 12–18px.
- Cibles tactiles ≥ 44px. Langue : français intégral. Fonctionne hors‑ligne.

STACK :
- Si ce dépôt a déjà une stack/des conventions, RESPECTE‑LES (lis package.json, la structure, le linter).
- Sinon, propose‑moi un choix avant de démarrer (recommandé : React Native + Expo, ou Flutter).
- Centralise les tokens de design (couleurs, typos, rayons) dans un thème unique.
- La clé API OpenRouter va dans le stockage local sécurisé, JAMAIS en dur dans le code.

PORTÉE (README §4) — 8 écrans + navigation :
Accueil · Catalogue · Fiche détail · Récoltes · Noter une récolte · Inventaire · Calendrier
(par mois + agenda annuel) · Ajouter une graine · Paramètres.
Navigation : 5 onglets en bas + FAB d'ajout + écran Paramètres depuis l'accueil.

LOGIQUE MÉTIER À REPRODUIRE FIDÈLEMENT (README §6) :
- Calcul de viabilité par durée de faculté germinative (ex. carotte 1–2 ans → au‑delà = "Hors durée").
- Statuts Encore viable / Dernière saison / Hors durée + couleurs.
- Alertes d'accueil "À surveiller", remplissage des zones, calendrier dont la fenêtre de récolte
  peut boucler sur l'année (poireau 10→3).

INTÉGRATIONS (README §7) :
- Recherche d'image via l'API publique Wikimedia Commons (sans clé) + lien Google Images.
- Assistant IA via OpenRouter (modèles :free) : clé saisie en Paramètres, réponse JSON parsée,
  proposition affichée et VALIDÉE par l'utilisateur avant enregistrement.

MÉTHODE DE TRAVAIL :
1. Confirme la stack et propose une structure de fichiers + un plan court.
2. Mets en place le thème (tokens), les polices, la navigation, puis le modèle de données + données de démo.
3. Implémente les écrans un par un, en te comparant aux captures correspondantes. Commence par
   Catalogue + Fiche détail (les plus structurants).
4. Ajoute la logique métier (§6), puis les intégrations (§7).
5. Vérifie la "Définition de terminé" (README §9).

Procède par étapes, montre‑moi ton plan d'abord, et arrête‑toi pour validation après la mise en place
du thème + navigation + un premier écran, avant de dérouler le reste.
````

---

## Conseils d'utilisation

- **Donne bien accès au dossier complet** à Claude Code (README + `screenshots/` + `design-reference/`).
  Les captures sont essentielles pour qu'il respecte le rendu.
- Si tu as **déjà un dépôt**, lance Claude Code dedans et adapte la première ligne du prompt
  (« implémente dans ce dépôt existant en respectant ses conventions »).
- Pour itérer écran par écran, tu peux demander : « implémente uniquement l'écran X en te basant
  sur `screenshots/NN-x.png` et la section §4.x du README ».
- Pense à préciser ta **stack** si tu en as une (React Native, Flutter, Kotlin/Compose…), sinon
  Claude Code te proposera un choix.
- Rappelle‑lui de ne **jamais committer** ta clé OpenRouter.
