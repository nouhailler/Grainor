/**
 * Logique métier (README §6) — le cœur de l'app.
 * Viabilité / durée de faculté germinative, couleur de germination,
 * remplissage de zone, fenêtres de semis/récolte (qui peuvent boucler sur l'année).
 */
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  EMBR,
  GUIDES,
  RawSeed,
  RAW_SEEDS,
  ZONE_META,
} from '../data/seeds';
import { CYCLE, DIFF, FAMS, MONTHS, fmt, hexA } from '../theme/tokens';

export interface ViabilityInfo {
  vlabel: 'Hors durée' | 'Dernière saison' | 'Encore viable';
  vcolor: string;
  vsoft: string;
  vsub: string;
  yearsStored: number;
  longLabel: string;
  consPct: number; // largeur de la barre de conservation (0–100)
}

/** §6.1 — viabilité d'un lot à partir de l'année de récolte. */
export function viability(s: Pick<RawSeed, 'recolteAnnee' | 'longMin' | 'longMax'>): ViabilityInfo {
  const yearsStored = CURRENT_YEAR - s.recolteAnnee;
  const longLabel = s.longMin === s.longMax ? `${s.longMax} ans` : `${s.longMin}–${s.longMax} ans`;
  let vlabel: ViabilityInfo['vlabel'];
  let vcolor: string;
  let vsoft: string;
  let vsub: string;
  if (yearsStored > s.longMax) {
    vlabel = 'Hors durée';
    vcolor = '#BC6A43';
    vsoft = '#F3E2D5';
    vsub = 'Semence périmée';
  } else if (yearsStored >= s.longMin) {
    vlabel = 'Dernière saison';
    vcolor = '#B08A2E';
    vsoft = '#F1E7CF';
    vsub = 'À semer en priorité';
  } else {
    const rem = s.longMax - yearsStored;
    vlabel = 'Encore viable';
    vcolor = '#4F7A3F';
    vsoft = '#E3EBD6';
    vsub = `≈ ${rem} an(s) restants`;
  }
  const consPct = Math.max(0, Math.min(100, Math.round(((s.longMax - yearsStored) / s.longMax) * 100)));
  return { vlabel, vcolor, vsoft, vsub, yearsStored, longLabel, consPct };
}

/** §6.2 — couleur du taux de germination mesuré. */
export function germColors(germ: number): { color: string; soft: string; label: string } {
  if (germ >= 85) return { color: '#4F7A3F', soft: '#E3EBD6', label: 'Bon' };
  if (germ >= 70) return { color: '#B08A2E', soft: '#F1E7CF', label: 'Moyen' };
  return { color: '#BC6A43', soft: '#F2E0D2', label: 'Faible' };
}

/** §6.5 — appartenance d'un mois à une fenêtre [a,b] qui peut boucler sur l'année. */
export function inWin(m: number, a: number, b: number): boolean {
  return a <= b ? m >= a && m <= b : m >= a || m <= b;
}

/** Une variété est "à semer" au mois m si semisDébut ≤ m ≤ semisFin. */
export function isSemis(s: Pick<RawSeed, 'sd' | 'se'>, m: number): boolean {
  return s.sd <= m && m <= s.se;
}

export type EnrichedSeed = ReturnType<typeof enrich>;

/** Guide par défaut pour les variétés ajoutées sans fiche de récupération détaillée. */
const DEFAULT_GUIDE = {
  diff: 'Moyen' as const,
  note: 'Renseignez le mode de reproduction (autogame/allogame) et les besoins d\'isolement.',
  recolte: [] as { t: string; d: string }[],
  tri: [] as { t: string; d: string }[],
  germination: [] as { t: string; d: string }[],
};

/** Enrichit une variété brute avec toutes les valeurs dérivées d'affichage. */
export function enrich(s: RawSeed) {
  const familyColor = FAMS[s.famille] || '#7A7363';
  const g = germColors(s.germ);
  const cy = CYCLE[s.cycle] ?? CYCLE.annuelle;
  const guide = GUIDES[s.id] ?? DEFAULT_GUIDE;
  const dm = DIFF[guide.diff];
  const v = viability(s);
  return {
    ...s,
    familyColor,
    famSoft: hexA(familyColor, 0.13),
    initials: s.nom.slice(0, 2).toUpperCase(),
    germColor: g.color,
    germSoft: g.soft,
    germLabel: g.label,
    cycleLabel: cy.label,
    cycleColor: cy.color,
    cycleSoft: cy.soft,
    embr: EMBR,
    semisLabel: s.sd === s.se ? MONTHS[s.sd - 1] : `${MONTHS[s.sd - 1]} – ${MONTHS[s.se - 1]}`,
    qtyFmt: fmt(s.qty),
    low: s.qty < 100,
    cultivarQ: `« ${s.cultivar} »`,
    diffLabel: guide.diff,
    diffColor: dm.color,
    diffSoft: dm.soft,
    diffNote: guide.note,
    guide,
    // viabilité
    yearsStored: v.yearsStored,
    longLabel: v.longLabel,
    vlabel: v.vlabel,
    vcolor: v.vcolor,
    vsoft: v.vsoft,
    vsub: v.vsub,
    consW: `${v.consPct}%` as `${number}%`,
  };
}

/** Toutes les variétés enrichies, prêtes pour l'affichage. */
export function allSeeds(): EnrichedSeed[] {
  return RAW_SEEDS.map(enrich);
}

export interface ZoneView {
  key: string;
  name: string;
  cond: string;
  color: string;
  colorSoft: string;
  items: EnrichedSeed[];
  nbVar: number;
  total: number;
  totalFmt: string;
  fill: number; // §6.4
  barColor: string;
}

/** §6.4 — remplissage de chaque zone d'entreposage. */
export function zonesView(seeds: EnrichedSeed[], order: Array<'A' | 'B' | 'C' | 'D' | 'E'>): ZoneView[] {
  return order.map((z) => {
    const meta = ZONE_META[z];
    const items = seeds.filter((s) => s.zone === z);
    const total = items.reduce((a, s) => a + s.qty, 0);
    const fill = Math.min(100, Math.round((total / meta.cap) * 100));
    return {
      key: z,
      name: meta.name,
      cond: meta.cond,
      color: meta.color,
      colorSoft: hexA(meta.color, 0.16),
      items,
      nbVar: items.length,
      total,
      totalFmt: fmt(total),
      fill,
      barColor: fill > 85 ? '#BC6A43' : '#6E8466',
    };
  });
}

export { CURRENT_MONTH, CURRENT_YEAR };
