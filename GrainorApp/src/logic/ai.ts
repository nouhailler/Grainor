/**
 * 7.2 Assistant IA — OpenRouter.
 * La clé API n'est jamais en dur : elle vient du stockage local sécurisé (cf. AppContext).
 * On impose une réponse JSON ; le résultat est une AIDE à la saisie, validée par l'utilisateur.
 */

export interface AIModel {
  value: string;
  label: string;
}

/** Modèles gratuits (`:free`) proposés dans les Paramètres. */
export const AI_MODELS: AIModel[] = [
  { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B · gratuit' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash · gratuit' },
  { value: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 · gratuit' },
  { value: 'qwen/qwen-2.5-72b-instruct:free', label: 'Qwen 2.5 72B · gratuit' },
];

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
  dureeMin?: number;
  dureeMax?: number;
  semis?: string;
  recolteMois?: string;
  profondeur?: string;
  levee?: string;
  espacement?: string;
  type?: string;
  difficulte?: string;
  reproduction?: string;
  recolte?: string;
  tri?: string;
  germination?: string;
}

const SYSTEM_PROMPT =
  'Tu es expert en semences potagères et en botanique. Pour la variété demandée, réponds ' +
  'UNIQUEMENT par un objet JSON valide (aucun texte ni balise autour), avec ces clés : nom, ' +
  'cultivar, latin, famille, classe, ordre, genre, espece, cycle ("Annuelle"|"Bisannuelle"|' +
  '"Vivace"), dureeMin, dureeMax (entiers = années de faculté germinative), semis (ex "Mars – ' +
  'Avril"), recolteMois, profondeur, levee, espacement, type, difficulte ("Facile"|"Moyen"|' +
  '"Difficile"), reproduction (1 phrase sur autogamie/allogamie et isolement), recolte (2-3 ' +
  'phrases), tri (2-3 phrases), germination (1-2 phrases). Tout en français.';

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
