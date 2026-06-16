/**
 * 4.1 Accueil — tableau de bord : stats, à semer ce mois, à surveiller, dernières récoltes.
 */
import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Card, Dot, Logo, MonthCells, Pill, SectionLabel } from '../components/ui';
import { CURRENT_MONTH, EnrichedSeed, isSemis } from '../logic/seeds';
import { useApp } from '../store/AppContext';
import { colors, fonts, fmt, MONTHS_FULL, spacing } from '../theme/tokens';

type Alert = { seed: EnrichedSeed; tag: string; color: string; soft: string };

export function AccueilScreen() {
  const nav = useNavigation<any>();
  const { seeds, harvests } = useApp();

  const aSemer = useMemo(() => seeds.filter((s) => isSemis(s, CURRENT_MONTH)), [seeds]);

  const stats = useMemo(() => {
    const total = seeds.reduce((a, s) => a + s.qty, 0);
    const germ = seeds.length ? Math.round(seeds.reduce((a, s) => a + s.germ, 0) / seeds.length) : 0;
    return { varietes: seeds.length, total, aSemer: aSemer.length, germ };
  }, [seeds, aSemer]);

  // §6.3 — alertes "À surveiller" : hors durée, dernière saison, stock faible.
  const alerts = useMemo<Alert[]>(() => {
    const out: Alert[] = [];
    seeds.forEach((s) => {
      if (s.vlabel === 'Hors durée') out.push({ seed: s, tag: 'À écarter', color: '#BC6A43', soft: '#F3E2D5' });
    });
    seeds.forEach((s) => {
      if (s.vlabel === 'Dernière saison') out.push({ seed: s, tag: 'Priorité', color: '#B08A2E', soft: '#F1E7CF' });
    });
    seeds.forEach((s) => {
      if (s.low) out.push({ seed: s, tag: 'À multiplier', color: '#9A7B3E', soft: '#F2E8CE' });
    });
    return out;
  }, [seeds]);

  const lastHarvests = useMemo(
    () => [...harvests].sort((a, b) => b.sort.localeCompare(a.sort)).slice(0, 3),
    [harvests],
  );
  const seedById = (id: number) => seeds.find((s) => s.id === id);

  const today = `${new Date(2026, CURRENT_MONTH - 1, 16).getDate()} ${MONTHS_FULL[CURRENT_MONTH - 1].toLowerCase()} 2026`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <Logo />
            <View>
              <Text style={styles.brand}>Grainor</Text>
              <Text style={styles.brandSub}>Semences · Maraîchage</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => nav.navigate('Parametres')}>
              <Icon name="settings" size={18} color={colors.textSubtle} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>C</Text>
            </View>
          </View>
        </View>

        {/* Salutation */}
        <View style={styles.greetWrap}>
          <Text style={styles.greet}>Bonjour, Camille</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Recherche (raccourci Catalogue) */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => nav.navigate('Catalogue')}
        >
          <Icon name="search" size={17} color={colors.textFaint} />
          <Text style={styles.searchPlaceholder}>Rechercher une variété…</Text>
        </TouchableOpacity>

        {/* 4 tuiles de stats */}
        <View style={styles.statsGrid}>
          <StatTile value={fmt(stats.varietes)} label="Variétés" />
          <StatTile value={fmt(stats.total)} label="Graines stockées" />
          <StatTile value={fmt(stats.aSemer)} label="À semer ce mois" green />
          <StatTile value={`${stats.germ} %`} label="Germination moyenne" />
        </View>

        {/* À semer ce mois — carrousel */}
        {aSemer.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <View style={styles.sectionHead}>
              <SectionLabel>À semer ce mois‑ci</SectionLabel>
              <Text style={styles.sectionAside}>{MONTHS_FULL[CURRENT_MONTH - 1]}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.screenH, gap: 11, paddingTop: 12 }}
            >
              {aSemer.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.8}
                  onPress={() => nav.navigate('Detail', { seedId: s.id })}
                  style={[styles.semisCard, { borderLeftColor: s.familyColor }]}
                >
                  <Text style={styles.semisNom}>{s.nom}</Text>
                  <Text style={styles.semisCultivar} numberOfLines={1}>{s.cultivar}</Text>
                  <View style={{ marginTop: 10 }}>
                    <MonthCells sd={s.sd} se={s.se} current={CURRENT_MONTH} activeColor={s.familyColor} height={14} />
                  </View>
                  <Text style={styles.semisWin}>{s.semisLabel}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* À surveiller */}
        <View style={{ marginTop: 24, paddingHorizontal: spacing.screenH }}>
          <View style={[styles.sectionHead, { paddingHorizontal: 0 }]}>
            <SectionLabel>À surveiller</SectionLabel>
            <Text style={styles.sectionAside}>{alerts.length}</Text>
          </View>
          <View style={{ gap: spacing.cardGap, marginTop: 12 }}>
            {alerts.map((a, i) => (
              <Card key={`${a.seed.id}-${i}`}>
                <TouchableOpacity
                  style={styles.alertRow}
                  activeOpacity={0.7}
                  onPress={() => nav.navigate('Detail', { seedId: a.seed.id })}
                >
                  <View style={[styles.alertIcon, { backgroundColor: a.soft }]}>
                    <Icon name="alert" size={17} color={a.color} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.alertNom}>
                      {a.seed.nom} <Text style={styles.alertCultivar}>{a.seed.cultivar}</Text>
                    </Text>
                    <Text style={styles.alertSub}>{a.seed.vlabel} · {a.seed.vsub}</Text>
                  </View>
                  <Pill label={a.tag} color={a.color} soft={a.soft} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </View>

        {/* Dernières récoltes */}
        <View style={{ marginTop: 24, paddingHorizontal: spacing.screenH }}>
          <View style={[styles.sectionHead, { paddingHorizontal: 0 }]}>
            <SectionLabel>Dernières récoltes</SectionLabel>
            <TouchableOpacity onPress={() => nav.navigate('Recoltes')} activeOpacity={0.7}>
              <Text style={styles.link}>Tout voir →</Text>
            </TouchableOpacity>
          </View>
          <Card style={{ marginTop: 12 }}>
            {lastHarvests.map((h, i) => {
              const s = seedById(h.seedId);
              return (
                <View key={h.id} style={[styles.histRow, i > 0 && styles.histDivider]}>
                  <Dot color={s?.familyColor ?? colors.textFaint} size={8} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.histNom}>
                      {s?.nom} <Text style={styles.histCultivar}>{s?.cultivar}</Text>
                    </Text>
                    <Text style={styles.histMeta}>{h.dateLabel} · {h.methode}</Text>
                  </View>
                  <Text style={styles.histQty}>{fmt(h.qte)} gr</Text>
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ value, label, green = false }: { value: string; label: string; green?: boolean }) {
  return (
    <View style={[styles.tile, green ? styles.tileGreen : styles.tilePlain]}>
      <Text style={[styles.tileValue, green && { color: colors.onPrimary }]}>{value}</Text>
      <Text style={[styles.tileLabel, green && { color: colors.onPrimaryDim }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.screenH,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontFamily: fonts.serif, fontSize: 21, color: colors.text, letterSpacing: 0.2 },
  brandSub: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    color: colors.textFaint,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.primary },
  greetWrap: { paddingHorizontal: spacing.screenH, marginTop: 18 },
  greet: { fontFamily: fonts.serif, fontSize: 26, color: colors.text },
  date: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  searchBar: {
    marginHorizontal: spacing.screenH,
    marginTop: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPlaceholder: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenH,
    marginTop: 16,
    gap: 11,
  },
  tile: { width: '47.6%', borderRadius: 16, padding: 14, flexGrow: 1 },
  tilePlain: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tileGreen: { backgroundColor: colors.primary },
  tileValue: { fontFamily: fonts.serif, fontSize: 27, color: colors.text },
  tileLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
  },
  sectionAside: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  link: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.primaryDim },
  semisCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 13,
  },
  semisNom: { fontFamily: fonts.serif, fontSize: 16, color: colors.text },
  semisCultivar: { fontFamily: fonts.serifItalic, fontSize: 12, color: colors.textFaint, marginTop: 1 },
  semisWin: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.textMuted, marginTop: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  alertIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  alertNom: { fontFamily: fonts.serif, fontSize: 16, color: colors.text },
  alertCultivar: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textFaint },
  alertSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 },
  histDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  histNom: { fontFamily: fonts.serif, fontSize: 15.5, color: colors.text },
  histCultivar: { fontFamily: fonts.serifItalic, fontSize: 12, color: colors.textFaint },
  histMeta: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  histQty: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.text },
});
