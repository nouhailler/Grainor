/**
 * 7.2 Assistant IA — OpenRouter.
 * La clé API n'est jamais en dur : elle vient du stockage local sécurisé (cf. AppContext).
 * On impose une réponse JSON ; le résultat est une AIDE à la saisie, validée par l'utilisateur.
 */

export interface AIModel {
  value: string;
  label: string;
}

/** Modèles gratuits proposés par défaut (repli hors-ligne / avant chargement de la liste live). */
export const AI_MODELS: AIModel[] = [
  { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B · gratuit' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash · gratuit' },
  { value: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 · gratuit' },
  { value: 'qwen/qwen-2.5-72b-instruct:free', label: 'Qwen 2.5 72B · gratuit' },
];

/** Un modèle est « gratuit » si son id se termine par :free ou si son tarif est nul. */
function isFree(m: any): boolean {
  if (typeof m?.id === 'string' && m.id.endsWith(':free')) return true;
  const p = m?.pricing;
  if (!p) return false;
  const zero = (v: any) => v === 0 || v === '0' || parseFloat(v) === 0;
  return zero(p.prompt) && zero(p.completion);
}

/**
 * Récupère la liste LIVE de tous les modèles gratuits d'OpenRouter.
 * L'appel valide aussi la clé (401 → clé invalide).
 */
export async function fetchFreeModels(key: string): Promise<AIModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: key ? { Authorization: 'Bearer ' + key } : undefined,
  });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message || 'Clé invalide ou API indisponible.');
  const list: any[] = Array.isArray(j.data) ? j.data : [];
  const models = list
    .filter(isFree)
    .map((m) => ({ value: m.id as string, label: (m.name as string) || (m.id as string) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  return models;
}

/** Une étape de guide renvoyée par l'IA (titre + détail). */
export interface AIStep {
  titre?: string;
  detail?: string;
  t?: string;
  d?: string;
}

/** Proposition renvoyée par l'IA (tous les champs sont optionnels et révisables). */
export interface AIProposal {
  nom?: string;
  cultivar?: string;
  latin?: string;
  famille?: string;
  classe?: string;
  ordre?: string;
  genre?: string;
  espece?: string;
  cycle?: string;
  type?: string;
  semisDebut?: number;
  semisFin?: number;
  recolteDebut?: number;
  recolteFin?: number;
  recolteMois?: string;
  profondeur?: string;
  levee?: string;
  espacement?: string;
  dureeMin?: number;
  dureeMax?: number;
  germination?: number;
  origine?: string;
  difficulte?: string;
  reproduction?: string;
  guideRecolte?: AIStep[];
  guideTri?: AIStep[];
  guideGermination?: AIStep[];
}

const SYSTEM_PROMPT =
  "Tu es expert en semences potagères et en botanique. Pour la variété demandée, réponds " +
  "UNIQUEMENT par un objet JSON valide (aucun texte ni balise autour), TOUT en français, avec " +
  "EXACTEMENT ces clés, toutes renseignées avec des valeurs réalistes (ne laisse AUCUN champ " +
  "vide) :\n" +
  '"nom" (nom commun), "cultivar" (nom de la variété), "latin" (binôme latin), ' +
  '"famille" (famille botanique française, ex. Solanacées, Apiacées, Cucurbitacées, Fabacées, ' +
  "Astéracées, Lamiacées, Brassicacées, Amaryllidacées, Amaranthacées), " +
  '"classe", "ordre", "genre", "espece", ' +
  '"cycle" ("Annuelle"|"Bisannuelle"|"Vivace"), "type" (ex. "Légume-fruit", "Aromatique"), ' +
  '"semisDebut","semisFin","recolteDebut","recolteFin" (entiers 1-12 = numéros de mois), ' +
  '"recolteMois" (libellé court, ex. "Juil. – Oct."), ' +
  '"profondeur" (ex. "1 cm"), "levee" (ex. "6–10 j"), "espacement" (ex. "40 cm"), ' +
  '"dureeMin","dureeMax" (entiers = années de faculté germinative), ' +
  '"germination" (entier 0-100 = taux de germination typique), ' +
  '"origine" (ex. "Variété ancienne"), ' +
  '"difficulte" ("Facile"|"Moyen"|"Difficile"), ' +
  '"reproduction" (1 phrase : autogamie/allogamie + isolement), ' +
  '"guideRecolte","guideTri","guideGermination" : chacun un tableau de 2 à 4 étapes, ' +
  'chaque étape = objet {"titre","detail"} (titre court ; detail = 1-2 phrases concrètes).';

/** Convertit des étapes IA en étapes de guide internes {t,d}. */
export function aiStepsToGuide(arr?: AIStep[]): { t: string; d: string }[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => ({ t: String(s?.titre ?? s?.t ?? '').trim(), d: String(s?.detail ?? s?.d ?? '').trim() }))
    .filter((s) => s.t || s.d);
}

/** Extrait un objet JSON, avec repli sur le premier bloc {…} trouvé. */
export function parseAI(txt: string): AIProposal | null {
  try {
    return JSON.parse(txt);
  } catch {}
  const m = txt && txt.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }
  return null;
}

/** Interroge OpenRouter pour pré-remplir une fiche variété. */
export async function askOpenRouter(name: string, key: string, model: string): Promise<AIProposal> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      'X-Title': 'Grainor',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: name },
      ],
    }),
  });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message || "Erreur de l'API");
  const txt: string = j?.choices?.[0]?.message?.content || '';
  const data = parseAI(txt);
  if (!data) throw new Error("Réponse de l'IA illisible, réessayez.");
  return data;
}
