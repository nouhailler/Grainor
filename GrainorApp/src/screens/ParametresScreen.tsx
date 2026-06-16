/**
 * 4.8 Paramètres — clé OpenRouter (stockage local sécurisé) + choix du modèle gratuit.
 * La clé n'est jamais écrite en dur ni envoyée ailleurs qu'à OpenRouter.
 */
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
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
import { AI_MODELS } from '../logic/ai';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, spacing } from '../theme/tokens';

export function ParametresScreen() {
  const nav = useNavigation<any>();
  const { apiKey, aiModel, saveApiKey } = useApp();
  const [key, setKey] = useState(apiKey);
  const [model, setModel] = useState(aiModel);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    await saveApiKey(key, model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
            automatique des fiches. Des modèles gratuits sont utilisés ; la clé reste sur cet appareil.
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

          <SectionLabel style={styles.fieldLabel}>Modèle gratuit</SectionLabel>
          <View style={{ gap: 8 }}>
            {AI_MODELS.map((m) => {
              const active = model === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  activeOpacity={0.7}
                  onPress={() => setModel(m.value)}
                  style={[styles.modelRow, { borderColor: active ? colors.primary : colors.borderStrong, backgroundColor: active ? colors.primarySoft : colors.surfaceInput }]}
                >
                  <View style={[styles.radio, { borderColor: active ? colors.primary : colors.textFaint }]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.modelLabel, active && { color: colors.primary }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.save, saved && styles.saveOk]} activeOpacity={0.85} onPress={onSave}>
            {saved && <Icon name="check" size={17} color={colors.onPrimary} strokeWidth={2.4} />}
            <Text style={styles.saveText}>{saved ? 'Enregistré' : 'Enregistrer'}</Text>
          </TouchableOpacity>
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
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  modelLabel: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.textBody },
  save: {
    marginTop: 20,
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
