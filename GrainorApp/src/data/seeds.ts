/**
 * Jeu de données de démonstration (README §5).
 * Repris tel quel de design-reference/Grainor.dc.html :
 * 11 variétés réalistes + 7 récoltes + 5 zones + guides espèce par espèce.
 */
import { CycleKey, DiffKey, StatusKey } from '../theme/tokens';

export interface GuideStep {
  t: string; // titre de l'étape
  d: string; // détail "comment procéder"
}

export interface SeedGuide {
  diff: DiffKey;
  note: string; // mode de reproduction / isolement
  recolte: GuideStep[];
  tri: GuideStep[];
  germination: GuideStep[];
}

export interface RawSeed {
  id: number;
  nom: string;
  cultivar: string;
  latin: string;
  famille: string;
  classe: string;
  ordre: string;
  genre: string;
  espece: string;
  cycle: CycleKey;
  sd: number; // semis début (mois 1–12)
  se: number; // semis fin
  rd: number; // récolte début
  re: number; // récolte fin (peut "boucler" : rd > re)
  qty: number;
  germ: number;
  recolte: string; // libellé "Sept. 2024"
  recolteAnnee: number;
  longMin: number; // années de faculté germinative (min)
  longMax: number;
  origine: string;
  zone: 'A' | 'B' | 'C' | 'D' | 'E';
  stockage: string;
  type: string;
  profondeur: string;
  levee: string;
  espacement: string;
  recolteMois: string;
  notes: string;
}

export interface RawHarvest {
  id: number;
  seedId: number;
  dateLabel: string;
  sort: string; // ISO pour tri
  qte: number;
  methode: 'Battage' | 'Fermentation' | 'Extraction humide' | 'Écossage';
  status: StatusKey;
  notes: string;
}

export interface ZoneMeta {
  name: string;
  cond: string;
  cap: number;
  color: string;
}

export const EMBR = 'Angiospermes';

export const ZONE_ORDER: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];

export const ZONE_META: Record<string, ZoneMeta> = {
  A: { name: 'Étagère A — Bocaux verre', cond: 'Sec · 15 °C · obscurité', cap: 1000, color: '#9A7B3E' },
  B: { name: 'Bacs réfrigérés', cond: 'Au frais · 4 °C · 35 % HR', cap: 6000, color: '#4E7E8A' },
  C: { name: 'Bocaux hermétiques', cond: 'Sec · gel de silice', cap: 900, color: '#8A8A3A' },
  D: { name: 'Armoire — Sachets kraft', cond: 'Ambiant · 18 °C', cap: 4200, color: '#7A6A9A' },
  E: { name: 'Étagère B — Aromatiques', cond: 'Sec · 15 °C', cap: 1500, color: '#6E8466' },
};

export const RAW_SEEDS: RawSeed[] = [
  { id: 1, nom: 'Tomate', cultivar: 'Cœur de Bœuf', latin: 'Solanum lycopersicum', famille: 'Solanacées', classe: 'Dicotylédones', ordre: 'Solanales', genre: 'Solanum', espece: 'S. lycopersicum', cycle: 'annuelle', sd: 3, se: 4, rd: 7, re: 10, qty: 240, germ: 92, recolte: 'Sept. 2024', recolteAnnee: 2024, longMin: 4, longMax: 6, origine: 'Récolte maison', zone: 'A', stockage: 'Étagère A · Bocal 2', type: 'Légume-fruit', profondeur: '0,5 cm', levee: '6–10 j', espacement: '60 cm', recolteMois: 'Juil. – Oct.', notes: 'Variété ancienne à gros fruits côtelés. Sélection sur les pieds les plus productifs et sains.' },
  { id: 2, nom: 'Carotte', cultivar: 'Nantaise 2', latin: 'Daucus carota', famille: 'Apiacées', classe: 'Dicotylédones', ordre: 'Apiales', genre: 'Daucus', espece: 'D. carota', cycle: 'bisannuelle', sd: 3, se: 7, rd: 6, re: 11, qty: 1850, germ: 78, recolte: 'Août 2024', recolteAnnee: 2024, longMin: 1, longMax: 2, origine: 'Ferme du Clos', zone: 'B', stockage: 'Bac réfrigéré B1', type: 'Légume-racine', profondeur: '1 cm', levee: '12–18 j', espacement: '5 cm', recolteMois: 'Juin – Nov.', notes: 'Semis en place, éclaircir à 5 cm. Semence à courte durée de vie — à renouveler vite.' },
  { id: 3, nom: 'Courgette', cultivar: 'Ronde de Nice', latin: 'Cucurbita pepo', famille: 'Cucurbitacées', classe: 'Dicotylédones', ordre: 'Cucurbitales', genre: 'Cucurbita', espece: 'C. pepo', cycle: 'annuelle', sd: 4, se: 5, rd: 7, re: 9, qty: 60, germ: 88, recolte: 'Sept. 2023', recolteAnnee: 2023, longMin: 5, longMax: 6, origine: 'Récolte maison', zone: 'A', stockage: 'Étagère A · Bocal 1', type: 'Légume-fruit', profondeur: '2 cm', levee: '5–8 j', espacement: '80 cm', recolteMois: 'Juil. – Sept.', notes: 'Fruits ronds à récolter jeunes. Stock faible — prévoir une multiplication cet été.' },
  { id: 4, nom: 'Haricot', cultivar: 'Tarbais', latin: 'Phaseolus vulgaris', famille: 'Fabacées', classe: 'Dicotylédones', ordre: 'Fabales', genre: 'Phaseolus', espece: 'P. vulgaris', cycle: 'annuelle', sd: 5, se: 6, rd: 9, re: 10, qty: 420, germ: 95, recolte: 'Oct. 2024', recolteAnnee: 2024, longMin: 3, longMax: 4, origine: 'Échange grainothèque', zone: 'C', stockage: 'Bocal hermétique C3', type: 'Légumineuse', profondeur: '3 cm', levee: '7–12 j', espacement: '40 cm', recolteMois: 'Sept. – Oct.', notes: 'Haricot à rames, tuteurage indispensable. Excellente conservation au sec.' },
  { id: 5, nom: 'Laitue', cultivar: 'Reine de Mai', latin: 'Lactuca sativa', famille: 'Astéracées', classe: 'Dicotylédones', ordre: 'Asterales', genre: 'Lactuca', espece: 'L. sativa', cycle: 'annuelle', sd: 2, se: 9, rd: 4, re: 10, qty: 980, germ: 71, recolte: 'Juil. 2024', recolteAnnee: 2024, longMin: 4, longMax: 5, origine: 'Ferme du Clos', zone: 'D', stockage: 'Sachet kraft D2', type: 'Légume-feuille', profondeur: '0,5 cm', levee: '4–7 j', espacement: '25 cm', recolteMois: 'Avr. – Oct.', notes: 'Semis échelonnés tous les 15 jours. Germination en baisse, à surveiller.' },
  { id: 6, nom: 'Basilic', cultivar: 'Grand Vert', latin: 'Ocimum basilicum', famille: 'Lamiacées', classe: 'Dicotylédones', ordre: 'Lamiales', genre: 'Ocimum', espece: 'O. basilicum', cycle: 'annuelle', sd: 4, se: 6, rd: 6, re: 9, qty: 1200, germ: 84, recolte: 'Sept. 2024', recolteAnnee: 2024, longMin: 4, longMax: 5, origine: 'Récolte maison', zone: 'E', stockage: 'Étagère B · Sachet 4', type: 'Aromatique', profondeur: '0,5 cm', levee: '6–9 j', espacement: '20 cm', recolteMois: 'Juin – Sept.', notes: 'Semis au chaud (20 °C). Pincer les têtes pour favoriser la ramification.' },
  { id: 7, nom: 'Radis', cultivar: 'De 18 jours', latin: 'Raphanus sativus', famille: 'Brassicacées', classe: 'Dicotylédones', ordre: 'Brassicales', genre: 'Raphanus', espece: 'R. sativus', cycle: 'annuelle', sd: 3, se: 9, rd: 4, re: 10, qty: 2300, germ: 90, recolte: 'Juin 2024', recolteAnnee: 2024, longMin: 4, longMax: 5, origine: 'Lot fournisseur', zone: 'B', stockage: 'Bac réfrigéré B2', type: 'Légume-racine', profondeur: '1 cm', levee: '3–5 j', espacement: '3 cm', recolteMois: 'Avr. – Oct.', notes: 'Croissance rapide, idéal en intercalaire. Gros stock disponible.' },
  { id: 8, nom: 'Poireau', cultivar: 'Bleu de Solaize', latin: 'Allium porrum', famille: 'Amaryllidacées', classe: 'Monocotylédones', ordre: 'Asparagales', genre: 'Allium', espece: 'A. porrum', cycle: 'bisannuelle', sd: 2, se: 4, rd: 10, re: 3, qty: 540, germ: 64, recolte: 'Août 2022', recolteAnnee: 2022, longMin: 2, longMax: 3, origine: 'Récolte maison', zone: 'D', stockage: 'Sachet kraft D5', type: 'Légume-feuille', profondeur: '1 cm', levee: '14–21 j', espacement: '15 cm', recolteMois: 'Oct. – Mars', notes: 'Semence de 2022 hors durée germinative. Tester avant semis ou remplacer le lot.' },
  { id: 9, nom: 'Betterave', cultivar: 'Crapaudine', latin: 'Beta vulgaris', famille: 'Amaranthacées', classe: 'Dicotylédones', ordre: 'Caryophyllales', genre: 'Beta', espece: 'B. vulgaris', cycle: 'bisannuelle', sd: 4, se: 6, rd: 9, re: 11, qty: 760, germ: 81, recolte: 'Sept. 2024', recolteAnnee: 2024, longMin: 5, longMax: 6, origine: 'Échange grainothèque', zone: 'B', stockage: 'Bac réfrigéré B3', type: 'Légume-racine', profondeur: '2 cm', levee: '8–14 j', espacement: '10 cm', recolteMois: 'Sept. – Nov.', notes: 'Variété ancienne à peau rugueuse, très rustique et sucrée.' },
  { id: 10, nom: 'Épinard', cultivar: "Géant d'hiver", latin: 'Spinacia oleracea', famille: 'Amaranthacées', classe: 'Dicotylédones', ordre: 'Caryophyllales', genre: 'Spinacia', espece: 'S. oleracea', cycle: 'annuelle', sd: 8, se: 9, rd: 10, re: 4, qty: 1100, germ: 58, recolte: 'Juin 2021', recolteAnnee: 2021, longMin: 3, longMax: 4, origine: 'Récolte maison', zone: 'D', stockage: 'Sachet kraft D1', type: 'Légume-feuille', profondeur: '2 cm', levee: '7–14 j', espacement: '10 cm', recolteMois: 'Oct. – Avr.', notes: 'Lot de 2021 hors durée de conservation (58 %). À écarter ou semer dense.' },
  { id: 11, nom: 'Ciboulette', cultivar: 'Commune', latin: 'Allium schoenoprasum', famille: 'Amaryllidacées', classe: 'Monocotylédones', ordre: 'Asparagales', genre: 'Allium', espece: 'A. schoenoprasum', cycle: 'vivace', sd: 3, se: 6, rd: 5, re: 9, qty: 320, germ: 73, recolte: 'Juil. 2024', recolteAnnee: 2024, longMin: 2, longMax: 3, origine: 'Récolte maison', zone: 'E', stockage: 'Étagère B · Sachet 6', type: 'Aromatique', profondeur: '0,5 cm', levee: '10–18 j', espacement: '20 cm', recolteMois: 'Mai – Sept.', notes: 'Aromatique vivace : la touffe repart chaque année. Graines à courte durée de vie.' },
];

export const RAW_HARVESTS: RawHarvest[] = [
  { id: 1, seedId: 1, dateLabel: '18 sept. 2025', sort: '2025-09-18', qte: 240, methode: 'Fermentation', status: 'stocke', notes: 'Fermentation 3 jours puis rinçage. Très bon rendement.' },
  { id: 2, seedId: 4, dateLabel: '02 oct. 2025', sort: '2025-10-02', qte: 420, methode: 'Battage', status: 'stocke', notes: 'Gousses séchées sur pied, battage à la main.' },
  { id: 3, seedId: 9, dateLabel: '10 sept. 2025', sort: '2025-09-10', qte: 760, methode: 'Battage', status: 'trier', notes: 'Glomérules à frotter et tamiser avant stockage.' },
  { id: 4, seedId: 6, dateLabel: '28 août 2025', sort: '2025-08-28', qte: 1200, methode: 'Battage', status: 'stocke', notes: 'Hampes florales sèches, tamisage fin.' },
  { id: 5, seedId: 3, dateLabel: '25 sept. 2025', sort: '2025-09-25', qte: 60, methode: 'Extraction humide', status: 'sechage', notes: 'Fruits laissés mûrir 3 semaines de plus, séchage sur claie.' },
  { id: 6, seedId: 5, dateLabel: '14 mai 2026', sort: '2026-05-14', qte: 180, methode: 'Battage', status: 'sechage', notes: 'Montée à graines au printemps, récolte échelonnée.' },
  { id: 7, seedId: 7, dateLabel: '06 juin 2026', sort: '2026-06-06', qte: 220, methode: 'Battage', status: 'trier', notes: 'Siliques sèches à écosser.' },
];

export const GUIDES: Record<number, SeedGuide> = {
  1: { diff: 'Moyen', note: 'Autogame : ressemis fidèle, peu de croisements. La pulpe contient un gel inhibiteur qui impose une fermentation.', recolte: [{ t: 'Choisir les fruits', d: 'Récoltez des tomates bien mûres, voire un peu blettes, sur les pieds les plus sains et productifs.' }, { t: 'Extraire la pulpe', d: 'Coupez le fruit en deux et pressez graines + jus dans un bocal.' }, { t: 'Fermenter 2 à 4 jours', d: 'Laissez à température ambiante : la fermentation dissout le gel et élimine certaines maladies. Une mousse se forme en surface.' }], tri: [{ t: 'Rincer', d: 'Versez dans une passoire fine et rincez : les graines pleines coulent, les vides et débris surnagent.' }, { t: 'Sécher', d: "Étalez sur une assiette ou du papier sec (évitez l'essuie-tout qui colle) 1 à 2 semaines." }], germination: [{ t: 'Semer au chaud', d: 'Semis à 20–25 °C en godet, 0,5 cm de profondeur. Levée en 6–10 jours.' }, { t: 'Repiquer', d: 'Repiquez au stade 2 vraies feuilles, puis endurcissez avant plantation.' }] },
  2: { diff: 'Difficile', note: 'Bisannuelle et allogame : fleurit la 2ᵉ année et se croise facilement (carotte sauvage). Isolez les porte-graines. Semence à courte durée de vie.', recolte: [{ t: 'Laisser monter', d: "Conservez quelques belles racines en terre l'hiver ; la 2ᵉ année, elles montent en ombelles." }, { t: 'Récolter les ombelles', d: 'Coupez quand elles brunissent et se referment en « nid d\'oiseau ».' }, { t: 'Sécher', d: 'Séchez les ombelles à l\'abri, bien ventilées, 1 à 2 semaines.' }], tri: [{ t: 'Battre', d: 'Frottez les ombelles entre les mains pour détacher les graines.' }, { t: 'Nettoyer', d: 'Retirez les « barbes » en frottant, tamisez puis ventilez doucement (graines très légères).' }], germination: [{ t: 'Semer en place', d: 'La carotte n\'aime pas le repiquage : semez directement, 1 cm de profondeur.' }, { t: 'Patienter', d: 'Levée lente (12–18 j), gardez le sol humide. Utilisez des graines récentes : viabilité 1–2 ans.' }] },
  3: { diff: 'Facile', note: 'Allogame : risque de croisement entre variétés de Cucurbita pepo. Isolez ou pollinisez à la main.', recolte: [{ t: 'Laisser mûrir un fruit', d: 'Sacrifiez un fruit : laissez-le grossir bien au-delà du stade culinaire, jusqu\'à peau dure (2–3 semaines de plus).' }, { t: 'Ressuyer', d: 'Après cueillette, laissez le fruit mûrir encore 2–3 semaines à l\'abri.' }, { t: 'Extraire', d: 'Ouvrez le fruit et prélevez les graines dans la pulpe.' }], tri: [{ t: 'Rincer', d: 'Lavez les graines, retirez la pulpe ; les graines pleines coulent.' }, { t: 'Sécher', d: 'Faites sécher 1 à 2 semaines sur une claie.' }], germination: [{ t: 'Semer au chaud', d: 'Semis à 18–20 °C, 2 cm de profondeur. Levée rapide en 5–8 jours.' }] },
  4: { diff: 'Facile', note: 'Autogame : ressemis très fidèle, idéal pour débuter la récupération de semences.', recolte: [{ t: 'Sécher sur pied', d: 'Laissez les gousses sécher sur la plante jusqu\'à ce qu\'elles soient brunes et cassantes.' }, { t: 'Récolter au sec', d: 'Cueillez avant les pluies ; finissez le séchage à l\'abri si nécessaire.' }], tri: [{ t: 'Écosser', d: 'Écossez à la main, ou battez les gousses dans un sac.' }, { t: 'Trier', d: 'Ventilez pour éliminer les débris et écartez les graines tachées (anthracnose).' }], germination: [{ t: 'Semer après gelées', d: 'Semis en place une fois tout risque de gel écarté, 3 cm. Levée 7–12 j.' }, { t: 'Anti-bruche', d: 'Optionnel : placez les graines 48 h au congélateur pour détruire les bruches.' }] },
  5: { diff: 'Facile', note: 'Autogame : récolte fidèle. Les graines mûrissent de façon échelonnée, comme un pissenlit.', recolte: [{ t: 'Laisser fleurir', d: 'Laissez la laitue monter en fleurs puis former des aigrettes plumeuses.' }, { t: 'Récolter en plusieurs fois', d: 'Quand environ la moitié des aigrettes sont blanches, secouez les têtes dans un seau tous les 2–3 jours.' }], tri: [{ t: 'Frotter', d: 'Frottez et émiettez les têtes pour séparer graines et aigrettes.' }, { t: 'Ventiler', d: 'Soufflez doucement pour éliminer les aigrettes (graines légères).' }], germination: [{ t: 'Semer en surface', d: 'Semis superficiel (0,5 cm) : la graine germe à la lumière. Levée 4–7 j.' }, { t: 'Semer au frais', d: 'Au-dessus de 25 °C la germination se bloque (dormance) : semez tôt le matin ou à l\'ombre.' }] },
  6: { diff: 'Facile', note: 'Croisements possibles entre variétés de basilic : isolez-les si vous tenez à la pureté.', recolte: [{ t: 'Laisser sécher les épis', d: 'Laissez fleurir puis sécher les hampes florales sur pied jusqu\'à ce qu\'elles brunissent.' }, { t: 'Récolter', d: 'Coupez les épis bruns et secs.' }], tri: [{ t: 'Frotter', d: 'Frottez les épis pour libérer les petites graines noires.' }, { t: 'Tamiser', d: 'Tamisez finement et ventilez : les calices partent avec les déchets.' }], germination: [{ t: 'Semer au chaud', d: 'Semis à 20 °C, graines à peine recouvertes. Levée 6–9 j.' }] },
  7: { diff: 'Moyen', note: 'Allogame : isolez des autres radis et Brassicacées. Gardez au moins 6 pieds pour la diversité génétique.', recolte: [{ t: 'Laisser monter à graines', d: 'Ne récoltez pas la racine : laissez le radis fleurir et former des siliques (cosses).' }, { t: 'Récolter les siliques', d: 'Cueillez quand les siliques sont sèches et beige.' }], tri: [{ t: 'Battre', d: 'Les siliques de radis sont coriaces : écrasez-les ou battez-les dans un sac solide.' }, { t: 'Nettoyer', d: 'Tamisez puis ventilez pour séparer graines et cosses.' }], germination: [{ t: 'Semer', d: 'Semis 1 cm, levée très rapide en 3–5 j.' }] },
  8: { diff: 'Difficile', note: 'Bisannuelle et allogame : fleurit la 2ᵉ année, isolez des autres poireaux. Semence à courte durée de vie (2–3 ans).', recolte: [{ t: 'Laisser fleurir', d: 'Conservez quelques pieds en terre : la 2ᵉ année ils forment une grosse boule de fleurs (ombelle).' }, { t: 'Récolter', d: 'Récoltez l\'ombelle quand les capsules s\'ouvrent et laissent voir les graines noires.' }], tri: [{ t: 'Égrener', d: 'Séchez l\'ombelle puis frottez pour extraire les graines noires.' }, { t: 'Trier à l\'eau', d: 'Trempez : les graines pleines coulent, les vides flottent. Re-séchez rapidement.' }], germination: [{ t: 'Semer', d: 'Semis 1 cm. Levée lente, 14–21 j.' }, { t: 'Tester avant', d: 'Faites un test de germination : la viabilité chute vite après 2–3 ans.' }] },
  9: { diff: 'Difficile', note: 'Bisannuelle et allogame (pollen porté loin par le vent) : isolez fortement. Se croise avec la bette et la betterave fourragère.', recolte: [{ t: 'Conserver les racines', d: 'Gardez les racines l\'hiver (cave, sable), replantez au printemps pour la montée à graines.' }, { t: 'Récolter les tiges', d: 'Récoltez quand les glomérules sont secs et bruns.' }], tri: [{ t: 'Égrener', d: 'Frottez les tiges pour détacher les glomérules (chaque glomérule = plusieurs graines soudées).' }, { t: 'Nettoyer', d: 'Tamisez et ventilez.' }], germination: [{ t: 'Tremper puis semer', d: 'Un trempage 24 h accélère la levée. Semis 2 cm, levée 8–14 j.' }] },
  10: { diff: 'Moyen', note: 'Dioïque (pieds mâles et femelles) et allogame par le vent : isolez. Conservez surtout les pieds femelles.', recolte: [{ t: 'Repérer les pieds', d: 'Gardez les pieds femelles (qui portent les graines) et quelques mâles pour la pollinisation.' }, { t: 'Récolter', d: 'Récoltez quand les tiges jaunissent et que les graines durcissent.' }], tri: [{ t: 'Égrener (avec des gants)', d: 'Les graines peuvent être piquantes : frottez les tiges avec des gants pour les détacher.' }, { t: 'Nettoyer', d: 'Tamisez et ventilez.' }], germination: [{ t: 'Semer au frais', d: 'Semis 2 cm : l\'épinard germe mal au chaud. Levée 7–14 j.' }] },
  11: { diff: 'Moyen', note: 'Vivace : la touffe repart chaque année et se multiplie aussi par division. Graines à courte durée de vie (2–3 ans).', recolte: [{ t: 'Laisser fleurir', d: 'Laissez les boules roses fleurir puis former des capsules.' }, { t: 'Récolter', d: 'Récoltez les têtes quand les capsules brunissent et montrent des graines noires.' }], tri: [{ t: 'Frotter', d: 'Séchez puis frottez les têtes pour libérer les graines noires.' }, { t: 'Trier à l\'eau', d: 'Tamisez ; un trempage élimine les graines vides qui flottent.' }], germination: [{ t: 'Semer', d: 'Semis 0,5 cm, levée 10–18 j. Renouvelez la semence souvent.' }] },
};

/** Année "courante" du jeu de démo (le prototype calcule la viabilité sur 2026). */
export const CURRENT_YEAR = 2026;
/** Mois "courant" du jeu de démo (juin = mis en évidence dans le proto). */
export const CURRENT_MONTH = 6;
