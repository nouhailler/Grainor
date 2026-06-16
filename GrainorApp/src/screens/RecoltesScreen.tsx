/**
 * 4.4 Récoltes — journal de récupération des semences.
 * Bandeau de saison, filtre par statut, liste des récoltes.
 */
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Card, Dot, Pill } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, fonts, fmt, spacing, STATUS, StatusKey } from '../theme/tokens';

const FILTERS: Array<{ key: 'all' | StatusKey; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'stocke', label: 'Stocké' },
  { key: 'sechage', label: 'Séchage' },
  { key: 'trier', label: 'À trier' },
];

export function RecoltesScreen() {
  const nav = useNavigation<any>();
  const { harvests, seeds } = useApp();
  const [filter, setFilter] = useState<'all' | StatusKey>('all');

  const seedById = (id: number) => seeds.find((s) => s.id === id);

  const banner = useMemo(() => {
    const total = harvests.reduce((a, h) => a + h.qte, 0);
    const sechage = harvests.filter((h) => h.status === 'sechage').length;
    return { nb: harvests.length, total, sechage };
  }, [harvests]);

  const list = useMemo(() => {
    const sorted = [...harvests].sort((a, b) => b.sort.localeCompare(a.sort));
    return filter === 'all' ? sorted : sorted.filter((h) => h.status === filter);
  }, [harvests, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Récoltes</Text>
          <Text style={styles.subtitle}>Journal de récupération des semences</Text>
        </View>

        {/* Bandeau de saison */}
        <View style={styles.banner}>
          <BannerStat value={fmt(banner.nb)} label="Récupérations" />
          <View style={styles.bannerDivider} />
          <BannerStat value={fmt(banner.total)} label="Graines récupérées" />
          <View style={styles.bannerDivider} />
          <BannerStat value={fmt(banner.sechage)} label="En séchage" />
        </View>

        {/* Bouton noter une récolte */}
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => nav.navigate('NoterRecolte', {})}
        >
          <Icon name="plus" size={18} color={colors.onPrimary} strokeWidth={2.2} />
          <Text style={styles.ctaText}>Noter une récolte</Text>
        </TouchableOpacity>

        {/* Filtres par statut */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.7}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong },
                ]}
              >
                <Text style={[styles.chipLabel, { color: active ? colors.surfaceAlt : colors.textBody }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Liste */}
        <View style={styles.list}>
          {list.map((h) => {
            const s = seedById(h.seedId);
            const st = STATUS[h.status];
            return (
              <Card key={h.id}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => s && nav.navigate('Detail', { seedId: s.id })}
                  style={styles.row}
                >
                  <View style={styles.rowHead}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <Dot color={s?.familyColor ?? colors.textFaint} size={9} />
                      <Text style={styles.rowNom} numberOfLines={1}>
                        {s?.nom} <Text style={styles.rowCultivar}>{s?.cultivar}</Text>
                      </Text>
                    </View>
                    <Pill label={st.label} color={st.color} soft={st.soft} />
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaDate}>{h.dateLabel}</Text>
                    <View style={styles.methodChip}>
                      <Text style={styles.methodText}>{h.methode}</Text>
                    </View>
                    <Text style={styles.metaQty}>{fmt(h.qte)} gr</Text>
                  </View>
                  {!!h.notes && <Text style={styles.notes} numberOfLines={2}>{h.notes}</Text>}
                </TouchableOpacity>
              </Card>
            );
          })}
          {list.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune récolte</Text>
              <Text style={styles.emptySub}>Notez une récupération de semences pour la voir ici.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BannerStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.bannerValue}>{value}</Text>
      <Text style={styles.bannerLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.screenH, paddingTop: 12 },
  title: { fontFamily: fonts.serif, fontSize: 25, color: colors.text },
  subtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  banner: {
    marginHorizontal: spacing.screenH,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerDivider: { width: 1, height: 34, backgroundColor: colors.divider },
  bannerValue: { fontFamily: fonts.serif, fontSize: 23, color: colors.text },
  bannerLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  cta: {
    marginHorizontal: spacing.screenH,
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onPrimary },
  chipsRow: { gap: 8, paddingHorizontal: spacing.screenH, paddingVertical: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1 },
  chipLabel: { fontFamily: fonts.sansSemi, fontSize: 12.5 },
  list: { paddingHorizontal: spacing.screenH, gap: spacing.cardGap },
  row: { padding: 14 },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowNom: { fontFamily: fonts.serif, fontSize: 16, color: colors.text, flexShrink: 1 },
  rowCultivar: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textFaint },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9 },
  metaDate: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  methodChip: { backgroundColor: colors.chipNeutralBg, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 9 },
  methodText: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.textSubtle },
  metaQty: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.text, marginLeft: 'auto' },
  notes: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSubtle2, marginTop: 9, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.textMuted },
  emptySub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 6, textAlign: 'center' },
});
