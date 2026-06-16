/**
 * Grainor — tokens de design centralisés (README §2).
 * Source de vérité : design-reference/Grainor.dc.html.
 * Toute couleur / typo / rayon de l'UI doit passer par ce fichier.
 */

// ─────────────────────────────────────────── Couleurs (§2.1)
export const colors = {
  bg: '#EFE7D6', // fond app
  surface: '#FCFAF5', // cartes, champs, lignes
  surfaceAlt: '#FBF7EE', // nav, pastilles claires
  surfaceInput: '#FFFDF8', // fond des champs de saisie
  primary: '#33503B', // vert forêt
  primaryGradFrom: '#3C5B41', // dégradés (logo, FAB, bandeau IA)
  primaryGradTo: '#2A4030',
  primarySoft: '#E2EAD6', // boutons secondaires, avatars
  primaryDim: '#6E8466', // liens "→", accents discrets
  onPrimary: '#F4EFE2', // texte sur fond vert
  onPrimaryDim: '#BFD2B2',
  onPrimaryFaint: '#A9C29A',
  seedDot: '#CFE0BE', // point clair du logo / accent IA

  text: '#2B271F', // titres, texte fort
  textStrong: '#4E4838',
  textBody: '#4A4536',
  textMuted: '#8C8270', // légendes, libellés
  textFaint: '#9A917F', // tertiaire, placeholders
  textPlaceholder: '#B5AC99',
  textSubtle: '#5E5848',
  textSubtle2: '#6E6657',

  border: 'rgba(80,60,30,0.10)', // bordure de carte standard
  borderStrong: 'rgba(80,60,30,0.12)',
  borderInput: 'rgba(80,60,30,0.16)',
  borderFaint: 'rgba(80,60,30,0.08)',
  divider: 'rgba(80,60,30,0.06)',

  track: '#EAE0CE', // fond des barres de progression
  trackAlt: '#E7DECB',
  cellOff: '#E7DECB', // case de mois inactive
  cellOffAlt: '#EBE3D3',

  navInactive: '#A89E89',
  recolteBar: '#9A7B4E', // barre récolte (agenda annuel)
  chipNeutralBg: '#F1ECE0', // chip méthode (neutre)
  segTrack: '#E7DDCB', // fond des bascules segmentées
};

// Couleurs sémantiques — statut / viabilité (§2.1)
export const semantic = {
  good: { color: '#4F7A3F', soft: '#E3EBD6' }, // viable / réussi
  warn: { color: '#B08A2E', soft: '#F1E7CF' }, // attention / priorité / séchage
  alert: { color: '#BC6A43', soft: '#F3E2D5' }, // hors-durée / à trier
  multiply: { color: '#9A7B3E', soft: '#F2E8CE' }, // stock faible "À multiplier"
};

// Couleur par famille botanique (§2.1) — repère visuel central
export const FAMS: Record<string, string> = {
  Solanacées: '#BE5A3E',
  Apiacées: '#CB7A35',
  Cucurbitacées: '#C9952F',
  Fabacées: '#8A8A3A',
  Astéracées: '#6F8B4E',
  Lamiacées: '#8A6A8C',
  Brassicacées: '#3E7E72',
  Amaryllidacées: '#4E7E8A',
  Amaranthacées: '#9B4E63',
};

// Cycle de vie (§2.1)
export type CycleKey = 'annuelle' | 'bisannuelle' | 'vivace';
export const CYCLE: Record<CycleKey, { label: string; color: string; soft: string }> = {
  annuelle: { label: 'Annuelle', color: '#6F8B4E', soft: '#E6EBD7' },
  bisannuelle: { label: 'Bisannuelle', color: '#B08A2E', soft: '#F1E7CF' },
  vivace: { label: 'Vivace', color: '#3E7E72', soft: '#DCEAE5' },
};

// Statut de récolte
export type StatusKey = 'stocke' | 'sechage' | 'trier';
export const STATUS: Record<StatusKey, { label: string; color: string; soft: string }> = {
  stocke: { label: 'Séché & stocké', color: '#4F7A3F', soft: '#E3EBD6' },
  sechage: { label: 'Séchage en cours', color: '#B08A2E', soft: '#F1E7CF' },
  trier: { label: 'À trier', color: '#BC6A43', soft: '#F3E2D5' },
};

// Difficulté de récupération
export type DiffKey = 'Facile' | 'Moyen' | 'Difficile';
export const DIFF: Record<DiffKey, { color: string; soft: string }> = {
  Facile: { color: '#4F7A3F', soft: '#E3EBD6' },
  Moyen: { color: '#B08A2E', soft: '#F1E7CF' },
  Difficile: { color: '#BC6A43', soft: '#F3E2D5' },
};

// ─────────────────────────────────────────── Typographie (§2.2)
export const fonts = {
  serif: 'Newsreader_400Regular',
  serifMedium: 'Newsreader_500Medium',
  serifSemi: 'Newsreader_600SemiBold',
  serifItalic: 'Newsreader_400Regular_Italic',
  sans: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemi: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
};

// ─────────────────────────────────────────── Formes (§2.3)
export const radius = {
  field: 12,
  smallCard: 14,
  card: 16,
  large: 18,
  hero: 20,
  pill: 22,
  fab: 18,
};

export const spacing = {
  screenH: 20, // padding horizontal d'écran
  cardGap: 11, // gap entre cartes
  cardPad: 14, // padding interne de carte
};

export const shadow = {
  fab: {
    shadowColor: '#2A4030',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 12,
  },
  logo: {
    shadowColor: '#2A4030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
};

// Mois (FR)
export const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
export const MONTHS_FULL = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Couleur hex → rgba avec alpha (pastille "soft" d'une famille = ~13 %). */
export function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Format de nombre FR (séparateur de milliers). */
export function fmt(n: number): string {
  return n.toLocaleString('fr-FR');
}
