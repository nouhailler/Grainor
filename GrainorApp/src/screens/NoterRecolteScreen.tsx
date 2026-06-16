/**
 * 4.4 Noter une récolte — variété, date, quantité, méthode d'extraction, statut, notes.
 * Enregistre une récupération dans le journal (store) puis revient en arrière.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dot, SectionLabel, TopBar } from '../components/ui';
import { RawHarvest } from '../data/seeds';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, spacing, STATUS, StatusKey } from '../theme/tokens';

type Methode = RawHarvest['methode'];
const METHODES: Methode[] = ['Battage', 'Fermentation', 'Extraction humide', 'Écossage'];
const STATUTS: StatusKey[] = ['sechage', 'trier', 'stocke'];

export function NoterRecolteScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'NoterRecolte'>>();
  const { seeds, addHarvest } = useApp();

  const [seedId, setSeedId] = useState<number | undefined>(route.params?.seedId);
  const [date, setDate] = useState('');
  const [qte, setQte] = useState('');
  const [methode, setMethode] = useState<Methode>('Battage');
  const [statut, setStatut] = useState<StatusKey>('sechage');
  const [notes, setNotes] = useState('');

  const canSave = seedId != null && qte.trim() !== '' && date.trim() !== '';

  const save = () => {
    if (!canSave || seedId == null) return;
    addHarvest({
      seedId,
      dateLabel: date.trim(),
      sort: new Date().toISOString().slice(0, 10),
      qte: parseInt(qte, 10) || 0,
      methode,
      status: statut,
      notes: notes.trim(),
    });
    nav.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="Noter une récolte" onBack={() => nav.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.screenH, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Variété */}
        <SectionLabel style={styles.label}>Variété</SectionLabel>
        <View style={styles.wrapRow}>
          {seeds.map((s) => {
            const active = seedId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.7}
                onPress={() => setSeedId(s.id)}
                style={[
                  styles.seedChip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong },
                ]}
              >
                <Dot color={active ? colors.onPrimary : s.familyColor} size={7} />
                <Text style={[styles.seedChipText, { color: active ? colors.onPrimary : colors.textBody }]} numberOfLines={1}>
                  {s.nom} · {s.cultivar}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date + quantité */}
        <View style={{ flexDirection: 'row', gap: 11, marginTop: 18 }}>
          <View style={{ flex: 1 }}>
            <SectionLabel style={styles.label}>Date</SectionLabel>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="14 juin 2026"
              placeholderTextColor={colors.textPlaceholder}
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SectionLabel style={styles.label}>Quantité (gr)</SectionLabel>
            <TextInput
              value={qte}
              onChangeText={setQte}
              placeholder="240"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
        </View>

        {/* Méthode d'extraction */}
        <SectionLabel style={[styles.label, { marginTop: 18 }]}>Méthode d'extraction</SectionLabel>
        <View style={styles.wrapRow}>
          {METHODES.map((m) => {
            const active = methode === m;
            return (
              <TouchableOpacity
                key={m}
                activeOpacity={0.7}
                onPress={() => setMethode(m)}
                style={[
                  styles.optChip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong },
                ]}
              >
                <Text style={[styles.optChipText, { color: active ? colors.onPrimary : colors.textBody }]}>{m}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Statut */}
        <SectionLabel style={[styles.label, { marginTop: 18 }]}>Statut</SectionLabel>
        <View style={styles.wrapRow}>
          {STATUTS.map((k) => {
            const active = statut === k;
            const st = STATUS[k];
            return (
              <TouchableOpacity
                key={k}
                activeOpacity={0.7}
                onPress={() => setStatut(k)}
                style={[
                  styles.optChip,
                  { backgroundColor: active ? st.soft : colors.surface, borderColor: active ? st.color : colors.borderStrong },
                ]}
              >
                <Dot color={st.color} size={7} />
                <Text style={[styles.optChipText, { color: active ? st.color : colors.textBody, marginLeft: 6 }]}>{st.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes */}
        <SectionLabel style={[styles.label, { marginTop: 18 }]}>Notes</SectionLabel>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Méthode, rendement, observations…"
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, styles.textarea]}
          multiline
        />

        <TouchableOpacity
          style={[styles.save, !canSave && styles.saveDisabled]}
          activeOpacity={0.85}
          disabled={!canSave}
          onPress={save}
        >
          <Text style={styles.saveText}>Enregistrer la récolte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  label: { marginBottom: 9 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: '100%',
  },
  seedChipText: { fontFamily: fonts.sansSemi, fontSize: 12.5, flexShrink: 1 },
  optChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  optChipText: { fontFamily: fonts.sansSemi, fontSize: 12.5 },
  input: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  save: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveDisabled: { opacity: 0.45 },
  saveText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onPrimary },
});
