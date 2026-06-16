/** Types de navigation partagés. */
export type RootStackParamList = {
  Tabs: undefined;
  Detail: { seedId: number };
  Ajout: { query?: string } | undefined;
  NoterRecolte: { seedId?: number } | undefined;
  Parametres: undefined;
};

export type TabParamList = {
  Accueil: undefined;
  Catalogue: undefined;
  Recoltes: undefined;
  Inventaire: undefined;
  Calendrier: undefined;
};
