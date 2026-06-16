/**
 * 4.8 Paramètres — clé OpenRouter (stockage local sécurisé) + choix du modèle gratuit.
 * Une fois la clé saisie et validée, on charge la liste LIVE de tous les modèles gratuits
 * d'OpenRouter ; le modèle choisi est persisté pour la suite. La clé n'est jamais écrite en dur
 * ni envoyée ailleurs qu'à OpenRouter.
 */
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Card, SectionLabel, TopBar } from '../components/ui';
import { AI_MODELS, AIModel, fetchFreeModels } from '../logic/ai';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, spacing } from '../theme/tokens';

export function ParametresScreen() {
  const nav = useNavigation<any>();
  const { apiKey, aiModel, saveApiKey } = useApp();
  const [key, setKey] = useState(apiKey);
  const [model, setModel] = useState(aiModel);
  const [saved, setSaved] = useState(false);

  const [models, setModels] = useState<AIModel[]>(AI_MODELS);
  const [live, setLive] = useState(false); // true quand la liste vient d'OpenRouter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const loadModels = useCallback(async (k: string) => {
    if (!k.trim()) return;
    setLoading(true);
    setError('');
    try {
      const list = await fetchFreeModels(k.trim());
      if (list.length) {
        setModels(list);
        setLive(true);
        // Si le modèle courant n'est plus dans la liste, sélectionner le premier.
        setModel((m) => (list.some((x) => x.value === m) ? m : list[0].value));
      } else {
        setError('Aucun modèle gratuit retourné par OpenRouter.');
      }
    } catch (e: any) {
      setError(e?.message || 'Clé invalide ou connexion indisponible.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Au montage : si une clé est déjà enregistrée, charger la liste live.
  useEffect(() => {
    if (apiKey) loadModels(apiKey);
  }, [apiKey, loadModels]);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Enregistrer la clé → persiste et valide en chargeant la liste des modèles gratuits.
  const onSaveKey = async () => {
    await saveApiKey(key, model);
    flash();
    loadModels(key);
  };

  // Sélection d'un modèle → persisté immédiatement pour la suite de l'utilisation.
  const onPickModel = async (value: string) => {
    setModel(value);
    if (key.trim()) {
      await saveApiKey(key, value);
      flash();
    }
  };

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? models.filter((m) => m.label.toLowerCase().includes(q) || m.value.toLowerCase().includes(q)) : models;
  }, [models, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="Paramètres" onBack={() => nav.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.screenH, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel style={{ marginTop: 8, marginBottom: 11 }}>Assistant IA — OpenRouter</SectionLabel>

        <Card style={styles.card}>
          <Text style={styles.desc}>
            Collez une clé <Text style={styles.bold}>OpenRouter</Text> pour activer le remplissage
            automatique des fiches. Seuls des modèles gratuits sont proposés ; la clé reste sur cet appareil.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://openrouter.ai/keys')} activeOpacity={0.7}>
            <Text style={styles.link}>Obtenir une clé gratuite ↗</Text>
          </TouchableOpacity>

          <SectionLabel style={styles.fieldLabel}>Clé API</SectionLabel>
          <TextInput
            value={key}
            onChangeText={setKey}
            placeholder="sk-or-v1-…"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <TouchableOpacity style={[styles.save, saved && styles.saveOk]} activeOpacity={0.85} onPress={onSaveKey}>
            {saved && <Icon name="check" size={17} color={colors.onPrimary} strokeWidth={2.4} />}
            <Text style={styles.saveText}>{saved ? 'Enregistré' : 'Enregistrer la clé'}</Text>
          </TouchableOpacity>

          {/* Modèles gratuits */}
          <View style={styles.modelHead}>
            <SectionLabel>Modèle gratuit</SectionLabel>
            {live && <Text style={styles.modelCount}>{models.length} disponibles</Text>}
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Vérification de la clé et chargement des modèles…</Text>
            </View>
          ) : error ? (
            <View>
              <Text style={styles.error}>{error}</Text>
              {!!key.trim() && (
                <TouchableOpacity onPress={() => loadModels(key)} activeOpacity={0.7}>
                  <Text style={styles.link}>Réessayer</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {!live && (
                <Text style={styles.hint}>
                  Enregistrez votre clé pour charger la liste complète des modèles gratuits d'OpenRouter.
                </Text>
              )}
              {models.length > 6 && (
                <TextInput
                  value={filter}
                  onChangeText={setFilter}
                  placeholder="Filtrer les modèles…"
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { marginBottom: 8 }]}
                  autoCapitalize="none"
                />
              )}
              <ScrollView
                style={models.length > 6 ? styles.modelScroll : undefined}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                <View style={{ gap: 8 }}>
                  {shown.map((m) => {
                    const active = model === m.value;
                    return (
                      <TouchableOpacity
                        key={m.value}
                        activeOpacity={0.7}
                        onPress={() => onPickModel(m.value)}
                        style={[styles.modelRow, { borderColor: active ? colors.primary : colors.borderStrong, backgroundColor: active ? colors.primarySoft : colors.surfaceInput }]}
                      >
                        <View style={[styles.radio, { borderColor: active ? colors.primary : colors.textFaint }]}>
                          {active && <View style={styles.radioDot} />}
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.modelLabel, active && { color: colors.primary }]} numberOfLines={1}>{m.label}</Text>
                          <Text style={styles.modelId} numberOfLines={1}>{m.value}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {shown.length === 0 && <Text style={styles.hint}>Aucun modèle ne correspond au filtre.</Text>}
                </View>
              </ScrollView>
            </>
          )}
        </Card>

        {/* À propos */}
        <SectionLabel style={{ marginTop: 24, marginBottom: 11 }}>À propos</SectionLabel>
        <Card style={styles.card}>
          <Text style={styles.about}>
            Grainor fonctionne <Text style={styles.bold}>hors‑ligne</Text>. Vos réglages, vos variétés et
            les images choisies restent sur cet appareil. Seules la recherche d'images (Wikimedia
            Commons) et l'assistant IA (OpenRouter) effectuent des appels réseau, à votre demande.
          </Text>
          <View style={styles.aboutMeta}>
            <Text style={styles.aboutMetaText}>Grainor · v0.1.0</Text>
            <Text style={styles.aboutMetaText}>Semences · Maraîchage</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  card: { padding: 15 },
  desc: { fontFamily: fonts.sans, fontSize: 13, color: colors.textBody, lineHeight: 20 },
  bold: { fontFamily: fonts.sansBold },
  link: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.primaryDim, marginTop: 9 },
  fieldLabel: { marginTop: 18, marginBottom: 9 },
  input: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.field,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
  },
  modelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  modelCount: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.textMuted },
  hint: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, lineHeight: 18, marginBottom: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  loadingText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, flex: 1 },
  error: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: '#BC6A43', lineHeight: 18 },
  modelScroll: { maxHeight: 280 },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  modelLabel: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.textBody },
  modelId: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.textFaint, marginTop: 1 },
  save: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 13,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveOk: { backgroundColor: '#4F7A3F' },
  saveText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onPrimary },
  about: { fontFamily: fonts.sans, fontSize: 13, color: colors.textBody, lineHeight: 20 },
  aboutMeta: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.divider, flexDirection: 'row', justifyContent: 'space-between' },
  aboutMetaText: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.textFaint },
});
