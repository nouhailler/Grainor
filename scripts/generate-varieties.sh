#!/usr/bin/env bash
#
# generate-varieties.sh — Génère les fiches Grainor des variétés du jardin via OpenRouter.
#
# But : produire un fichier JSON importable TEL QUEL par l'app (Paramètres → Importer JSON),
# sans consommer de tokens côté assistant. Reprend le MÊME prompt et le MÊME format que
# l'app (src/logic/ai.ts + src/store/AppContext.tsx → normalizeSeed/importData).
#
# Sécurité : la clé OpenRouter n'est JAMAIS en dur. Elle vient de l'environnement ou d'un
#            fichier hors dépôt. Ne committez jamais votre clé.
#
# Résumable : une fiche JSON est mise en cache par variété (cache/<slug>.json). Relancer le
#             script ne régénère que ce qui manque → aucun crédit gaspillé.
#
# ── Usage ───────────────────────────────────────────────────────────────────────────────
#   export OPENROUTER_API_KEY="sk-or-v1-..."        # OU : ~/.config/grainor/openrouter.key
#   ./scripts/generate-varieties.sh                 # génère tout ce qui manque
#   ./scripts/generate-varieties.sh --list-only     # affiche les variétés à traiter, sans appel
#   ./scripts/generate-varieties.sh --only "Tomate cerise,Melon Galia"
#   ./scripts/generate-varieties.sh --skip-demo     # saute les variétés déjà dans le jeu de démo
#   ./scripts/generate-varieties.sh --model "google/gemini-2.0-flash-exp:free"
#   ./scripts/generate-varieties.sh --out mon-import.json
#   ./scripts/generate-varieties.sh --input liste.txt   # une variété par ligne au lieu de CONTEXT.md
#
# Variables d'environnement :
#   OPENROUTER_API_KEY   clé API (prioritaire sur le fichier).
#   GRAINOR_MODEL        modèle par défaut (sinon meta-llama/llama-3.3-70b-instruct:free).
#   GRAINOR_SLEEP        pause (s) entre deux appels (défaut 1.5, pour ménager le quota gratuit).
#
set -uo pipefail

# ── Emplacements ────────────────────────────────────────────────────────────────────────
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
CONTEXT="$ROOT/CONTEXT.md"
CACHE="$HERE/cache"
KEYFILE="${HOME}/.config/grainor/openrouter.key"

# ── Paramètres par défaut ───────────────────────────────────────────────────────────────
MODEL="${GRAINOR_MODEL:-meta-llama/llama-3.3-70b-instruct:free}"
SLEEP="${GRAINOR_SLEEP:-1.5}"
OUT="$ROOT/grainor-varietes.json"
INPUT=""
ONLY=""
SKIP_DEMO=0
LIST_ONLY=0
RETRIES=3

# Variétés déjà présentes dans le jeu de démo (src/data/seeds.ts) — sautées si --skip-demo.
DEMO_SEEDS="Tomate|Carotte|Courgette|Haricot|Laitue|Basilic|Radis|Poireau|Betterave|Épinard|Ciboulette"

# ── Couleurs (si terminal) ──────────────────────────────────────────────────────────────
if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; D=$'\033[2m'; N=$'\033[0m'
else B=""; G=""; Y=""; R=""; D=""; N=""; fi
say()  { printf '%s\n' "$*"; }
ok()   { printf '%s✓%s %s\n'  "$G" "$N" "$*"; }
warn() { printf '%s!%s %s\n'  "$Y" "$N" "$*" >&2; }
err()  { printf '%s✗%s %s\n'  "$R" "$N" "$*" >&2; }

# ── Arguments ───────────────────────────────────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --model)      MODEL="$2"; shift 2;;
    --out)        OUT="$2"; shift 2;;
    --input)      INPUT="$2"; shift 2;;
    --only)       ONLY="$2"; shift 2;;
    --sleep)      SLEEP="$2"; shift 2;;
    --skip-demo)  SKIP_DEMO=1; shift;;
    --list-only)  LIST_ONLY=1; shift;;
    -h|--help)    grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0;;
    *)            err "Argument inconnu : $1"; exit 2;;
  esac
done

# ── Dépendances ─────────────────────────────────────────────────────────────────────────
for bin in curl jq python3; do
  command -v "$bin" >/dev/null 2>&1 || { err "Dépendance manquante : $bin"; exit 1; }
done

# ── Clé API (jamais en dur) ─────────────────────────────────────────────────────────────
API_KEY="${OPENROUTER_API_KEY:-}"
if [ -z "$API_KEY" ] && [ -f "$KEYFILE" ]; then
  API_KEY="$(tr -d ' \t\r\n' < "$KEYFILE")"
fi
if [ "$LIST_ONLY" -eq 0 ] && [ -z "$API_KEY" ]; then
  err "Aucune clé OpenRouter."
  say "  Définissez ${B}OPENROUTER_API_KEY${N} ou créez ${B}$KEYFILE${N} (chmod 600)."
  exit 1
fi

# ── Prompt système (IDENTIQUE à src/logic/ai.ts) ────────────────────────────────────────
read -r -d '' SYSTEM_PROMPT <<'PROMPT'
Tu es expert en PRODUCTION ET CONSERVATION DE SEMENCES potagères (grainothèque) et en botanique. Pour la variété demandée, réponds UNIQUEMENT par un objet JSON valide (aucun texte ni balise autour), TOUT en français, avec EXACTEMENT ces clés, toutes renseignées avec des valeurs réalistes (ne laisse AUCUN champ vide) :
"nom" (nom commun), "cultivar" (nom de la variété), "latin" (binôme latin), "famille" (famille botanique française, ex. Solanacées, Apiacées, Cucurbitacées, Fabacées, Astéracées, Lamiacées, Brassicacées, Amaryllidacées, Amaranthacées), "classe", "ordre", "genre", "espece", "cycle" ("Annuelle"|"Bisannuelle"|"Vivace"), "type" (ex. "Légume-fruit", "Aromatique"), "semisDebut","semisFin","recolteDebut","recolteFin" (entiers 1-12 = numéros de mois), "recolteMois" (libellé court, ex. "Juil. – Oct."), "profondeur" (ex. "1 cm"), "levee" (ex. "6–10 j"), "espacement" (ex. "40 cm"), "dureeMin","dureeMax" (entiers = années de faculté germinative), "germination" (entier 0-100 = taux de germination typique), "origine" (ex. "Variété ancienne"), "difficulte" ("Facile"|"Moyen"|"Difficile" — difficulté à PRODUIRE SOI-MÊME SES SEMENCES), "reproduction" (1 phrase : autogamie/allogamie + distance/isolement nécessaire pour des graines pures). IMPORTANT — Grainor est une GRAINOTHÈQUE : les trois guides ci-dessous concernent EXCLUSIVEMENT la SEMENCE (la graine) de la variété — comment la produire, la récupérer et la conserver — et JAMAIS la culture ni la récolte du légume destiné à la consommation. "guideRecolte" = RÉCOLTER LES GRAINES sur des porte-graines (laisser monter en graines / monter à fleur, repères de maturité des semences, moment et façon de récolter les graines, à maturité sèche le plus souvent) ; "guideTri" = EXTRAIRE, NETTOYER et TRIER LES GRAINES (égrenage/battage ou fermentation pour les graines à pulpe type tomate/courge, vannage, élimination de la balle et des graines vides, séchage avant stockage) ; "guideGermination" = CONSERVER et TESTER LA GERMINATION DES GRAINES récupérées (test de germination sur buvard, conditions de levée, durée de viabilité des semences). Chacun = un tableau de 2 à 4 étapes, chaque étape = objet {"titre","detail"} (titre court ; detail = 1-2 phrases concrètes, TOUJOURS centrées sur la graine).
PROMPT

# ── Liste des variétés ──────────────────────────────────────────────────────────────────
# Soit --input <fichier> (une par ligne), soit la section "Variétés (verbatim)" de CONTEXT.md.
load_varieties() {
  if [ -n "$INPUT" ]; then
    [ -f "$INPUT" ] || { err "Fichier introuvable : $INPUT"; exit 1; }
    grep -v '^[[:space:]]*$' "$INPUT"
    return
  fi
  [ -f "$CONTEXT" ] || { err "CONTEXT.md introuvable : $CONTEXT"; exit 1; }
  # Lignes "- [ ] Nom" (ou "- [x] Nom") sous la section backlog.
  awk '
    /^### Variétés \(verbatim\)/ { grab=1; next }
    /^## / && grab                 { grab=0 }
    grab && /^- \[.\] /            { sub(/^- \[.\] /,""); print }
  ' "$CONTEXT"
}

if [ -n "$ONLY" ]; then
  # Liste explicite séparée par des virgules.
  VARIETIES="$(printf '%s\n' "$ONLY" | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$')"
else
  VARIETIES="$(load_varieties)"
fi

[ -n "$VARIETIES" ] || { err "Aucune variété à traiter."; exit 1; }

# Filtre démo éventuel.
if [ "$SKIP_DEMO" -eq 1 ]; then
  VARIETIES="$(printf '%s\n' "$VARIETIES" | grep -viE "^(${DEMO_SEEDS})$")"
fi

TOTAL="$(printf '%s\n' "$VARIETIES" | grep -c '^')"

# ── slugify : nom → nom de fichier de cache stable ──────────────────────────────────────
slug() {
  printf '%s' "$1" \
    | python3 -c 'import sys,unicodedata,re;s=sys.stdin.read();s=unicodedata.normalize("NFKD",s).encode("ascii","ignore").decode();s=re.sub(r"[^a-zA-Z0-9]+","-",s).strip("-").lower();print(s)'
}

if [ "$LIST_ONLY" -eq 1 ]; then
  say "${B}$TOTAL variété(s)${N} à traiter :"
  printf '%s\n' "$VARIETIES" | nl -w3 -s'. '
  exit 0
fi

mkdir -p "$CACHE"
say "${B}Grainor — génération des fiches variétés${N}"
say "  modèle  : ${B}$MODEL${N}"
say "  total   : ${B}$TOTAL${N}   cache : ${D}$CACHE${N}"
say "  sortie  : ${D}$OUT${N}"
say ""

# ── mapping AIProposal → RawSeed (jq) ───────────────────────────────────────────────────
# Reproduit le mapping fait par l'app (AjoutScreen.save + normalizeSeed). On laisse qty=0 et
# germ par défaut raisonnable ; tout reste révisable dans l'app après import.
JQ_MAP='
  def stepify: map({ t: ((.titre // .t) // "" | tostring), d: ((.detail // .d) // "" | tostring) })
               | map(select((.t｜length>0) or (.d｜length>0)));
  def clampm(d): (if (type=="number" and . >= 1 and . <= 12) then (.|floor) else d end);
  def lc: (.|ascii_downcase);
  {
    nom:        ((.nom // $name) | tostring),
    cultivar:   ((.cultivar // "") | tostring),
    latin:      ((.latin // "") | tostring),
    famille:    ((.famille // "") | tostring),
    classe:     ((.classe // "") | tostring),
    ordre:      ((.ordre // "") | tostring),
    genre:      ((.genre // "") | tostring),
    espece:     ((.espece // "") | tostring),
    cycle:      ( (.cycle // "annuelle") | lc
                  | if . == "bisannuelle" or . == "vivace" then . else "annuelle" end ),
    sd:         ((.semisDebut    // 3) | clampm(3)),
    se:         ((.semisFin      // 4) | clampm(4)),
    rd:         ((.recolteDebut  // 7) | clampm(7)),
    re:         ((.recolteFin    // 9) | clampm(9)),
    qty:        0,
    germ:       ((.germination // 85) | (if type=="number" then (.|floor) else 85 end)),
    recolte:    "",
    recolteAnnee: 2026,
    longMin:    ((.dureeMin // 3) | (if type=="number" then (.|floor) else 3 end)),
    longMax:    ((.dureeMax // 4) | (if type=="number" then (.|floor) else 4 end)),
    origine:    ((.origine // "Jardin") | tostring),
    zone:       "A",
    stockage:   "",
    type:       ((.type // "") | tostring),
    profondeur: ((.profondeur // "") | tostring),
    levee:      ((.levee // "") | tostring),
    espacement: ((.espacement // "") | tostring),
    recolteMois:((.recolteMois // "") | tostring),
    notes:      ((.reproduction // "") | tostring),
    guide: {
      diff: ( (.difficulte // "Moyen")
              | if . == "Facile" or . == "Moyen" or . == "Difficile" then . else "Moyen" end ),
      note: ((.reproduction // "") | tostring),
      recolte:     ((.guideRecolte     // []) | stepify),
      tri:         ((.guideTri         // []) | stepify),
      germination: ((.guideGermination // []) | stepify)
    }
  }'
# jq n'aime pas le caractère "｜" ci-dessus : on le remplace par le vrai pipe à l'exécution.
JQ_MAP="${JQ_MAP//｜/|}"

# ── Appel OpenRouter pour une variété → écrit cache/<slug>.json ──────────────────────────
generate_one() {
  local name="$1" file="$2" attempt body http content mapped
  for attempt in $(seq 1 "$RETRIES"); do
    body="$(jq -n --arg m "$MODEL" --arg sys "$SYSTEM_PROMPT" --arg u "$name" \
      '{model:$m, temperature:0.2, messages:[{role:"system",content:$sys},{role:"user",content:$u}]}')"

    http="$(curl -sS -w '\n%{http_code}' \
      --max-time 120 \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -H "X-Title: Grainor" \
      -H "HTTP-Referer: https://github.com/nouhailler/Grainor" \
      -d "$body" \
      https://openrouter.ai/api/v1/chat/completions)"

    local code="${http##*$'\n'}"
    local payload="${http%$'\n'*}"

    if [ "$code" = "429" ]; then
      warn "  429 (quota) — pause ${attempt}0 s puis nouvel essai…"; sleep "${attempt}0"; continue
    fi
    if [ "$code" != "200" ]; then
      warn "  HTTP $code (essai $attempt/$RETRIES) : $(printf '%s' "$payload" | jq -r '.error.message? // empty' 2>/dev/null)"
      sleep "$((attempt*2))"; continue
    fi

    # Erreur applicative dans un 200 ?
    if printf '%s' "$payload" | jq -e '.error' >/dev/null 2>&1; then
      warn "  API: $(printf '%s' "$payload" | jq -r '.error.message')"; sleep "$((attempt*2))"; continue
    fi

    content="$(printf '%s' "$payload" | jq -r '.choices[0].message.content // empty')"
    [ -n "$content" ] || { warn "  réponse vide (essai $attempt)"; sleep 2; continue; }

    # Extraction robuste du 1er objet JSON (gère les ```fences``` et le texte parasite).
    local proposal
    proposal="$(printf '%s' "$content" | python3 -c '
import sys, json, re
t = sys.stdin.read().strip()
t = re.sub(r"^```(?:json)?", "", t).strip()
t = re.sub(r"```$", "", t).strip()
try:
    json.loads(t); sys.stdout.write(t); sys.exit(0)
except Exception:
    pass
m = re.search(r"\{.*\}", t, re.S)
if m:
    try:
        json.loads(m.group(0)); sys.stdout.write(m.group(0)); sys.exit(0)
    except Exception:
        pass
sys.exit(1)
')" || { warn "  JSON illisible (essai $attempt)"; sleep 2; continue; }

    # Mapping → RawSeed, puis on écrit le cache.
    mapped="$(printf '%s' "$proposal" | jq --arg name "$name" "$JQ_MAP" 2>/dev/null)" \
      || { warn "  mapping jq échoué (essai $attempt)"; sleep 2; continue; }

    printf '%s\n' "$mapped" > "$file"
    return 0
  done
  return 1
}

# ── Boucle principale ───────────────────────────────────────────────────────────────────
i=0; made=0; skipped=0; failed=0; FAILED_LIST=""
while IFS= read -r name; do
  [ -n "$name" ] || continue
  i=$((i+1))
  s="$(slug "$name")"
  file="$CACHE/$s.json"
  printf '%s[%3d/%d]%s %s' "$D" "$i" "$TOTAL" "$N" "$name"

  if [ -s "$file" ]; then
    printf '  %s(en cache)%s\n' "$D" "$N"; skipped=$((skipped+1)); continue
  fi
  printf '  …\r'

  if generate_one "$name" "$file"; then
    fam="$(jq -r '.famille // "?"' "$file")"
    printf '%s[%3d/%d]%s %s  %s→ %s%s\n' "$D" "$i" "$TOTAL" "$N" "$name" "$G" "$fam" "$N"
    made=$((made+1))
    sleep "$SLEEP"
  else
    printf '%s[%3d/%d]%s %s  %séchec%s\n' "$D" "$i" "$TOTAL" "$N" "$name" "$R" "$N"
    failed=$((failed+1)); FAILED_LIST="$FAILED_LIST\n  - $name"
  fi
done <<< "$VARIETIES"

# ── Assemblage du fichier d'import (tableau JSON = ajout au catalogue) ───────────────────
# On n'inclut QUE les variétés demandées dans CETTE exécution (selon le filtre courant).
say ""
say "${B}Assemblage de $OUT${N}"
{
  printf '['
  first=1
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    f="$CACHE/$(slug "$name").json"
    [ -s "$f" ] || continue
    if [ "$first" -eq 1 ]; then first=0; else printf ','; fi
    cat "$f"
  done <<< "$VARIETIES"
  printf ']\n'
} | jq '.' > "$OUT" 2>/dev/null

if [ -s "$OUT" ]; then
  count="$(jq 'length' "$OUT")"
  ok "$count fiche(s) écrites dans $OUT"
else
  err "Échec d'assemblage (aucune fiche valide)."; exit 1
fi

# ── Bilan ───────────────────────────────────────────────────────────────────────────────
say ""
say "${B}Bilan${N} : ${G}$made générées${N} · ${D}$skipped en cache${N} · ${R}$failed échec(s)${N}"
if [ "$failed" -gt 0 ]; then
  warn "Variétés en échec (relancez le script, le cache évite de tout refaire) :"
  printf '%b\n' "$FAILED_LIST" >&2
fi
say ""
say "${B}Import dans l'app :${N}"
say "  1. Ouvrez Grainor → ${B}Paramètres → Sauvegarde & restauration${N}."
say "  2. Collez le contenu de ${B}$OUT${N} dans le champ d'import, puis ${B}Importer${N}."
say "     (un tableau JSON = AJOUT au catalogue ; vos données existantes sont conservées.)"
say "  ${D}Relisez/ajustez chaque fiche dans l'app : qty, germination réelle, zone de stockage.${N}"
