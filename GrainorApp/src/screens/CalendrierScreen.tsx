/**
 * 4.6 Calendrier — bascule « Par mois » / « Agenda annuel ».
 * Par mois : variétés à semer + frise de 12 cases.
 * Agenda annuel : 1 ligne/variété × 12 mois, mini-barres semis (famille) + récolte (#9A7B4E).
 */
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, MonthCells } from '../components/ui';
import { CURRENT_MONTH, inWin, isSemis } from '../logic/seeds';
import { useApp } from '../store/AppContext';
import { colors, fonts, MONTHS, MONTHS_FULL, spacing } from '../theme/tokens';

const RECOLTE = colors.recolteBar;

export function CalendrierScreen() {
  const nav = useNavigation<any>();
  const { seeds } = useApp();
  const [tab, setTab] = useState<'mois' | 'annuel'>('mois');
  const [month, setMonth] = useState(CURRENT_MONTH);

  const semisDuMois = useMemo(() => seeds.filter((s) => isSemis(s, month)), [seeds, month]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendrier</Text>
        <Text style={styles.subtitle}>Semis & récoltes sur l'année</Text>
      </View>

      {/* Bascule segmentée */}
      <View style={styles.segment}>
        {(['mois', 'annuel'] as const).map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.8}
              onPress={() => setTab(t)}
              style={[styles.segItem, active && styles.segItemActive]}
            >
              <Text style={[styles.segText, active && styles.segTextActive]}>
                {t === 'mois' ? 'Par mois' : 'Agenda annuel'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tab === 'mois' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Sélecteur de mois */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
            {MONTHS.map((m, i) => {
              const idx = i + 1;
              const active = month === idx;
              return (
                <TouchableOpacity
                  key={m}
                  activeOpacity={0.7}
                  onPress={() => setMonth(idx)}
                  style={[
                    styles.monthChip,
                    { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong },
                  ]}
                >
                  <Text style={[styles.monthChipText, { color: active ? colors.surfaceAlt : colors.textBody }]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.monthHint}>
            {semisDuMois.length > 0
              ? `${semisDuMois.length} variété(s) à semer en ${MONTHS_FULL[month - 1].toLowerCase()}`
              : `Rien à semer en ${MONTHS_FULL[month - 1].toLowerCase()}`}
          </Text>

          <View style={styles.list}>
            {semisDuMois.map((s) => (
              <Card key={s.id}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => nav.navigate('Detail', { seedId: s.id })} style={styles.semisRow}>
                  <View style={styles.semisHead}>
                    <Text style={styles.semisNom}>
                      {s.nom} <Text style={styles.semisCultivar}>{s.cultivar}</Text>
                    </Text>
                    <Text style={styles.semisWin}>{s.semisLabel}</Text>
                  </View>
                  <View style={{ marginTop: 11 }}>
                    <MonthCells sd={s.sd} se={s.se} current={month} activeColor={s.familyColor} />
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Légende */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: colors.primaryDim }]} />
              <Text style={styles.legendText}>Semis</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: RECOLTE }]} />
              <Text style={styles.legendText}>Récolte</Text>
            </View>
          </View>

          <Card style={styles.agendaCard}>
            {/* En-tête des mois */}
            <View style={styles.agendaHeadRow}>
              <View style={styles.agendaLabelCol} />
              {MONTHS.map((m, i) => (
                <View key={m} style={styles.agendaCol}>
                  <Text style={[styles.agendaMonth, i + 1 === CURRENT_MONTH && styles.agendaMonthCurrent]}>
                    {m[0]}
                  </Text>
                </View>
              ))}
            </View>

            {/* Une ligne par variété */}
            {seeds.map((s, ri) => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.7}
                onPress={() => nav.navigate('Detail', { seedId: s.id })}
                style={[styles.agendaRow, ri > 0 && styles.agendaRowDivider]}
              >
                <View style={styles.agendaLabelCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.familyColor }} />
                    <Text style={styles.agendaName} numberOfLines={1}>{s.nom}</Text>
                  </View>
                </View>
                {MONTHS.map((m, i) => {
                  const mo = i + 1;
                  const sem = isSemis(s, mo);
                  const rec = inWin(mo, s.rd, s.re);
                  const cur = mo === CURRENT_MONTH;
                  return (
                    <View key={m} style={[styles.agendaCol, cur && styles.agendaColCurrent]}>
                      <View style={[styles.bar, { backgroundColor: sem ? s.familyColor : colors.cellOff }]} />
                      <View style={[styles.bar, { marginTop: 2, backgroundColor: rec ? RECOLTE : colors.cellOff }]} />
                    </View>
                  );
                })}
              </TouchableOpacity>
            ))}
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.screenH, paddingTop: 12 },
  title: { fontFamily: fonts.serif, fontSize: 25, color: colors.text },
  subtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  segment: {
    flexDirection: 'row',
    marginHorizontal: spacing.screenH,
    marginTop: 16,
    backgroundColor: colors.segTrack,
    borderRadius: 12,
    padding: 4,
  },
  segItem: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segItemActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  segText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.textMuted },
  segTextActive: { color: colors.primary },
  monthRow: { gap: 7, paddingHorizontal: spacing.screenH, paddingVertical: 16 },
  monthChip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 20, borderWidth: 1 },
  monthChipText: { fontFamily: fonts.sansSemi, fontSize: 12.5 },
  monthHint: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, paddingHorizontal: spacing.screenH },
  list: { paddingHorizontal: spacing.screenH, gap: spacing.cardGap, marginTop: 12 },
  semisRow: { padding: 14 },
  semisHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  semisNom: { fontFamily: fonts.serif, fontSize: 16, color: colors.text },
  semisCultivar: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textFaint },
  semisWin: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.textMuted },
  legend: { flexDirection: 'row', gap: 18, paddingHorizontal: spacing.screenH, paddingTop: 16, paddingBottom: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 8, borderRadius: 3 },
  legendText: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.textMuted },
  agendaCard: { margin: spacing.screenH, padding: 12 },
  agendaHeadRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
  agendaLabelCol: { width: 62 },
  agendaCol: { flex: 1, alignItems: 'center', paddingHorizontal: 1 },
  agendaColCurrent: { backgroundColor: colors.primarySoft, borderRadius: 4, paddingVertical: 2 },
  agendaMonth: { fontFamily: fonts.sansSemi, fontSize: 10, color: colors.textFaint },
  agendaMonthCurrent: { color: colors.primary, fontFamily: fonts.sansBold },
  agendaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  agendaRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  agendaName: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textBody, flexShrink: 1 },
  bar: { width: '85%', height: 6, borderRadius: 2 },
});
