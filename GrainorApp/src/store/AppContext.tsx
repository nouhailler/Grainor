/**
 * État global de Grainor — hors-ligne par défaut.
 * - variétés et récoltes : persistées localement (AsyncStorage), incluant les ajouts/imports
 * - photos par variété : persistées localement (AsyncStorage)
 * - clé API OpenRouter + modèle : stockage local sécurisé (SecureStore), jamais en dur
 * - import / export JSON : sauvegarde et restauration (changement de téléphone)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  RAW_HARVESTS,
  RAW_SEEDS,
  RawHarvest,
  RawSeed,
} from '../data/seeds';
import { enrich, EnrichedSeed } from '../logic/seeds';

const PHOTOS_KEY = 'grainor.photos';
const SEEDS_KEY = 'grainor.seeds';
const HARVESTS_KEY = 'grainor.harvests';
const SECURE_API_KEY = 'grainor.openrouter.key';
const SECURE_MODEL = 'grainor.openrouter.model';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export interface ImportResult {
  seeds: number;
  harvests: number;
  replaced: boolean;
}

interface AppState {
  seeds: EnrichedSeed[]; // toutes les variétés enrichies
  rawSeeds: RawSeed[];
  harvests: RawHarvest[];
  photos: Record<number, string>;
  apiKey: string;
  aiModel: string;
  ready: boolean;
  setPhoto: (seedId: number, url: string) => void;
  addHarvest: (h: Omit<RawHarvest, 'id'>) => void;
  addSeed: (s: RawSeed) => void;
  updateSeed: (s: RawSeed) => void;
  saveApiKey: (key: string, model: string) => Promise<void>;
  setApiKey: (key: string) => void;
  setAiModel: (model: string) => void;
  getSeed: (id: number) => EnrichedSeed | undefined;
  exportData: () => string;
  importData: (raw: string | unknown) => ImportResult;
}

const AppContext = createContext<AppState | null>(null);

/** Complète un objet variété arbitraire (import) en RawSeed valide. */
function normalizeSeed(s: any, id: number): RawSeed {
  const num = (v: any, d: number) => (Number.isFinite(+v) ? +v : d);
  const str = (v: any, d = '—') => (v == null || v === '' ? d : String(v));
  return {
    id,
    nom: str(s?.nom, 'Variété'),
    cultivar: str(s?.cultivar),
    latin: str(s?.latin),
    famille: str(s?.famille),
    classe: str(s?.classe),
    ordre: str(s?.ordre),
    genre: str(s?.genre),
    espece: str(s?.espece),
    cycle: (['annuelle', 'bisannuelle', 'vivace'].includes(s?.cycle) ? s.cycle : 'annuelle') as RawSeed['cycle'],
    sd: num(s?.sd, 3),
    se: num(s?.se, 4),
    rd: num(s?.rd, 7),
    re: num(s?.re, 9),
    qty: num(s?.qty, 0),
    germ: num(s?.germ, 0),
    recolte: str(s?.recolte),
    recolteAnnee: num(s?.recolteAnnee, 2026),
    longMin: num(s?.longMin, 3),
    longMax: num(s?.longMax, 4),
    origine: str(s?.origine, 'Import'),
    zone: (['A', 'B', 'C', 'D', 'E'].includes(s?.zone) ? s.zone : 'A') as RawSeed['zone'],
    stockage: str(s?.stockage),
    type: str(s?.type),
    profondeur: str(s?.profondeur),
    levee: str(s?.levee),
    espacement: str(s?.espacement),
    recolteMois: str(s?.recolteMois),
    notes: str(s?.notes, ''),
    guide: s?.guide,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [rawSeeds, setRawSeeds] = useState<RawSeed[]>(RAW_SEEDS);
  const [harvests, setHarvests] = useState<RawHarvest[]>(RAW_HARVESTS);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState(DEFAULT_MODEL);
  const [ready, setReady] = useState(false);

  // Chargement initial des données persistées.
  useEffect(() => {
    (async () => {
      try {
        const rawSeedsStored = await AsyncStorage.getItem(SEEDS_KEY);
        if (rawSeedsStored) setRawSeeds(JSON.parse(rawSeedsStored));
      } catch {}
      try {
        const harvestsStored = await AsyncStorage.getItem(HARVESTS_KEY);
        if (harvestsStored) setHarvests(JSON.parse(harvestsStored));
      } catch {}
      try {
        const rawPhotos = await AsyncStorage.getItem(PHOTOS_KEY);
        if (rawPhotos) setPhotos(JSON.parse(rawPhotos));
      } catch {}
      try {
        const k = await SecureStore.getItemAsync(SECURE_API_KEY);
        const m = await SecureStore.getItemAsync(SECURE_MODEL);
        if (k) setApiKey(k);
        if (m) setAiModel(m);
      } catch {}
      setReady(true);
    })();
  }, []);

  // Persistance des variétés / récoltes dès qu'elles changent (après le chargement initial).
  useEffect(() => {
    if (ready) AsyncStorage.setItem(SEEDS_KEY, JSON.stringify(rawSeeds)).catch(() => {});
  }, [rawSeeds, ready]);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(HARVESTS_KEY, JSON.stringify(harvests)).catch(() => {});
  }, [harvests, ready]);

  const seeds = useMemo<EnrichedSeed[]>(() => rawSeeds.map(enrich), [rawSeeds]);

  const value = useMemo<AppState>(
    () => ({
      seeds,
      rawSeeds,
      harvests,
      photos,
      apiKey,
      aiModel,
      ready,
      getSeed: (id: number) => seeds.find((s) => s.id === id),
      setPhoto: (seedId: number, url: string) => {
        setPhotos((prev) => {
          const next = { ...prev, [seedId]: url };
          AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
      },
      addHarvest: (h) => {
        setHarvests((prev) => [{ ...h, id: Math.max(0, ...prev.map((x) => x.id)) + 1 }, ...prev]);
      },
      addSeed: (s) => {
        setRawSeeds((prev) => [...prev, s]);
      },
      updateSeed: (s) => {
        setRawSeeds((prev) => prev.map((x) => (x.id === s.id ? s : x)));
      },
      saveApiKey: async (key: string, model: string) => {
        setApiKey(key);
        setAiModel(model);
        try {
          await SecureStore.setItemAsync(SECURE_API_KEY, key.trim());
          await SecureStore.setItemAsync(SECURE_MODEL, model);
        } catch {}
      },
      setApiKey,
      setAiModel,
      exportData: () =>
        JSON.stringify(
          { app: 'Grainor', version: 1, exportedAt: new Date().toISOString(), seeds: rawSeeds, harvests, photos },
          null,
          2,
        ),
      importData: (raw) => {
        const data: any = typeof raw === 'string' ? JSON.parse(raw) : raw;

        // Forme 1 : tableau de variétés → ajout.
        // Forme 2 : sauvegarde complète {seeds, harvests?, photos?} → restauration.
        // Forme 3 : une seule variété → ajout.
        let incomingSeeds: any[] = [];
        let incomingHarvests: any[] | null = null;
        let incomingPhotos: Record<number, string> | null = null;
        if (Array.isArray(data)) {
          incomingSeeds = data;
        } else if (data && Array.isArray(data.seeds)) {
          incomingSeeds = data.seeds;
          incomingHarvests = Array.isArray(data.harvests) ? data.harvests : null;
          incomingPhotos = data.photos && typeof data.photos === 'object' ? data.photos : null;
        } else if (data && (data.nom || data.latin)) {
          incomingSeeds = [data];
        } else {
          throw new Error('Format JSON non reconnu.');
        }

        const fullBackup = !Array.isArray(data) && !!(incomingHarvests || incomingPhotos);

        if (fullBackup) {
          let nextId = 1;
          const restored = incomingSeeds.map((s) => normalizeSeed(s, Number.isFinite(+s?.id) ? +s.id : nextId++));
          setRawSeeds(restored);
          if (incomingHarvests) setHarvests(incomingHarvests as RawHarvest[]);
          if (incomingPhotos) {
            setPhotos(incomingPhotos);
            AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(incomingPhotos)).catch(() => {});
          }
          return { seeds: restored.length, harvests: incomingHarvests ? incomingHarvests.length : 0, replaced: true };
        }

        // Ajout : identifiants neufs pour éviter les collisions.
        setRawSeeds((prev) => {
          let nextId = Math.max(0, ...prev.map((s) => s.id)) + 1;
          const list = incomingSeeds.map((s) => normalizeSeed(s, nextId++));
          return [...prev, ...list];
        });
        return { seeds: incomingSeeds.length, harvests: 0, replaced: false };
      },
    }),
    [seeds, rawSeeds, harvests, photos, apiKey, aiModel, ready],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans un AppProvider');
  return ctx;
}

export { DEFAULT_MODEL };
export type { EnrichedSeed };
