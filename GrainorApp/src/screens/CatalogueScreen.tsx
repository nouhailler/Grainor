/**
 * 4.2 Catalogue — recherche plein texte + chips de filtre par famille + liste de variétés.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Card, Pill } from '../components/ui';
import { EnrichedSeed } from '../logic/seeds';
import { useApp } from '../store/AppContext';
import { colors, fonts, FAMS, radius, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CatalogueScreen() {
  const nav = useNavigation<Nav>();
  const { seeds } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Compteurs par famille + construction des chips (Toutes + une par famille présente).
  const families = useMemo(() => {
    const counts: Record<string, number> = {};
    seeds.forEach((s) => (counts[s.famille] = (counts[s.famille] || 0) + 1));
    return [{ key: 'all', label: 'Toutes', color: colors.primary, count: seeds.length }].concat(
      Object.keys(FAMS)
        .filter((f) => counts[f])
        .map((f) => ({ key: f, label: f, color: FAMS[f], count: counts[f] })),
    );
  }, [seeds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = seeds;
    if (filter !== 'all') list = list.filter((s) => s.famille === filter);
    if (q) list = list.filter((s) => `${s.nom} ${s.cultivar} ${s.latin} ${s.famille}`.toLowerCase().includes(q));
    return list;
  }, [seeds, filter, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={styles.title}>Catalogue</Text>
            <Text style={styles.count}>{filtered.length} variétés</Text>
          </View>
          <View style={styles.searchBar}>
            <Icon name="search" size={17} color={colors.textFaint} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Nom, nom latin, famille…"
              placeholderTextColor={colors.textFaint}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Chips de filtre par famille */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {families.map((c) => {
            const active = filter === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.7}
                onPress={() => setFilter(c.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.borderStrong,
                  },
                ]}
              >
                {c.key !== 'all' && (
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: c.color }} />
                )}
                <Text
                  style={[styles.chipLabel, { color: active ? colors.surfaceAlt : colors.textBody }]}
                >
                  {c.label}
                </Text>
                <Text style={[styles.chipCount, { color: active ? colors.surfaceAlt : colors.textBody }]}>
                  {c.count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Liste */}
        <View style={styles.list}>
          {filtered.map((item) => (
            <SeedRow key={item.id} item={item} onPress={() => nav.navigate('Detail', { seedId: item.id })} />
          ))}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune variété</Text>
              {search.trim() ? (
                <>
                  <Text style={styles.emptySub}>
                    « {search.trim()} » n'est pas encore dans votre catalogue.
                  </Text>
                  <TouchableOpacity
                    style={styles.aiCreate}
                    activeOpacity={0.85}
                    onPress={() => nav.navigate('Ajout', { query: search.trim() })}
                  >
                    <Icon name="sparkle" size={17} color={colors.onPrimary} />
                    <Text style={styles.aiCreateText}>Créer cette variété avec l'IA</Text>
                  </TouchableOpacity>
                  <Text style={styles.emptyHint}>L'assistant remplit la fiche ; vous validez avant d'enregistrer.</Text>
                </>
              ) : (
                <Text style={styles.emptySub}>Essayez un autre filtre ou terme de recherche.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SeedRow({ item, onPress }: { item: EnrichedSeed; onPress: () => void }) {
  return (
    <Card>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
        {/* Carré coloré famille + initiales */}
        <View style={[styles.avatar, { backgroundColor: item.familyColor }]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
            <Text style={styles.rowNom}>{item.nom}</Text>
            <Text style={styles.rowCultivar} numberOfLines={1}>
              {item.cultivar}
            </Text>
          </View>
          <Text style={styles.rowLatin}>{item.latin}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 }}>
            <Pill label={item.famille} color={item.familyColor} soft={item.famSoft} />
            <Pill label={item.cycleLabel} color={item.cycleColor} soft={item.cycleSoft} dot />
          </View>
        </View>

        {/* Colonne droite : quantité, germination, viabilité */}
        <View style={{ alignItems: 'flex-end', gap: 5 }}>
          <Text style={styles.qty}>
            {item.qtyFmt} <Text style={styles.qtyUnit}>gr</Text>
          </Text>
          <View style={[styles.germBadge, { backgroundColor: item.germSoft }]}>
            <Text style={[styles.germText, { color: item.germColor }]}>{item.germ} %</Text>
          </View>
          <Text style={[styles.vlabel, { color: item.vcolor }]}>{item.vlabel}</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.screenH, paddingTop: 12 },
  title: { fontFamily: fonts.serif, fontSize: 25, color: colors.text },
  count: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  searchBar: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.smallCard,
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 14, color: colors.text, padding: 0 },
  chipsRow: { gap: 8, paddingHorizontal: spacing.screenH, paddingVertical: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipLabel: { fontFamily: fonts.sansSemi, fontSize: 12.5 },
  chipCount: { fontFamily: fonts.sans, fontSize: 11, opacity: 0.6 },
  list: { paddingHorizontal: spacing.screenH, gap: spacing.cardGap },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13 },
  avatar: { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.serif, fontSize: 18, color: colors.surfaceAlt },
  rowNom: { fontFamily: fonts.serif, fontSize: 17, color: colors.text },
  rowCultivar: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textFaint, flexShrink: 1 },
  rowLatin: { fontFamily: fonts.serifItalic, fontSize: 11.5, color: colors.textFaint, marginTop: 1 },
  qty: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.text },
  qtyUnit: { fontFamily: fonts.sans, fontWeight: '400', color: colors.textFaint, fontSize: 11 },
  germBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20 },
  germText: { fontFamily: fonts.sansBold, fontSize: 11 },
  vlabel: { fontFamily: fonts.sansSemi, fontSize: 9.5 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.textMuted },
  emptySub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 6, textAlign: 'center' },
  aiCreate: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  aiCreateText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.onPrimary },
  emptyHint: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textFaint, marginTop: 10, textAlign: 'center' },
});
