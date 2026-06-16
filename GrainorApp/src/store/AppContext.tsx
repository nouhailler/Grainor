/**
 * État global de Grainor — hors-ligne par défaut.
 * - photos par variété : persistées localement (AsyncStorage)
 * - clé API OpenRouter + modèle : stockage local sécurisé (SecureStore), jamais en dur
 * - récoltes : mutables (l'écran "Noter une récolte" en ajoute)
 * - variétés ajoutées par l'utilisateur (formulaire / IA)
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
import { allSeeds, enrich, EnrichedSeed } from '../logic/seeds';

const PHOTOS_KEY = 'grainor.photos';
const SECURE_API_KEY = 'grainor.openrouter.key';
const SECURE_MODEL = 'grainor.openrouter.model';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

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
  saveApiKey: (key: string, model: string) => Promise<void>;
  setApiKey: (key: string) => void;
  setAiModel: (model: string) => void;
  getSeed: (id: number) => EnrichedSeed | undefined;
}

const AppContext = createContext<AppState | null>(null);

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

  // Les variétés enrichies : recalculées quand les données brutes changent.
  // enrich() applique un guide par défaut si la variété ajoutée n'en a pas.
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
