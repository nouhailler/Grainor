/**
 * 4.3 Fiche détail — la vue la plus riche (visuel, viabilité, conservation,
 * fenêtre de semis, classification, culture, guide de récupération, historique, notes).
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { Gauge } from '../components/Gauge';
import { Icon } from '../components/Icon';
import { ImageSearchModal } from '../components/ImageSearchModal';
import { Card, Dot, MonthCells, Pill, SectionLabel } from '../components/ui';
import { CURRENT_MONTH } from '../logic/seeds';
import { useApp } from '../store/AppContext';
import { colors, fonts, hexA, radius, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

const GUIDE_TABS: Array<{ key: 'recolte' | 'tri' | 'germination'; label: string }> = [
  { key: 'recolte', label: 'Récolte' },
  { key: 'tri', label: 'Tri' },
  { key: 'germination', label: 'Germination' },
];

/** Trame rayée couleur famille (fallback quand aucune photo). */
function HeroStripe({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="stripe" patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(45)">
          <Rect width="24" height="24" fill={hexA(color, 0.08)} />
          <Rect width="12" height="24" fill={hexA(color, 0.22)} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#stripe)" />
    </Svg>
  );
}

export function DetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { getSeed, photos, setPhoto, harvests } = useApp();
  const [guideTab, setGuideTab] = useState<'recolte' | 'tri' | 'germination'>('recolte');
  const [imgOpen, setImgOpen] = useState(false);

  const sel = getSeed(route.params.seedId);

  const history = useMemo(() => {
    if (!sel) return [];
    return harvests
      .filter((h) => h.seedId === sel.id)
      .sort((a, b) => (a.sort < b.sort ? 1 : -1));
  }, [harvests, sel]);

  if (!sel) return null;
  const photo = photos[sel.id];
  const guideSteps = sel.guide[guideTab] || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* En-tête */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.roundBtn} activeOpacity={0.7}>
            <Icon name="back" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topbarLabel}>Fiche variété</Text>
          <View style={styles.roundBtn}>
            <Icon name="dots" size={18} color={colors.text} />
          </View>
        </View>

        {/* Visuel */}
        <View style={styles.hero}>
          {photo ? (
            <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <>
              <HeroStripe color={sel.familyColor} />
              <Text style={[styles.heroPlaceholder, { color: sel.familyColor }]}>[ photo · {sel.nom} ]</Text>
            </>
          )}
          <View style={styles.heroFamPill}>
            <Dot color={sel.familyColor} />
            <Text style={[styles.heroFamText, { color: sel.familyColor }]}>{sel.famille}</Text>
          </View>
          <TouchableOpacity style={styles.imgBtn} onPress={() => setImgOpen(true)} activeOpacity={0.8}>
            <Icon name="search" size={14} color={colors.primary} strokeWidth={2} />
            <Text style={styles.imgBtnText}>Image</Text>
          </TouchableOpacity>
        </View>

        {/* Titre */}
        <View style={{ paddingHorizontal: spacing.screenH, paddingTop: 16 }}>
          <Text style={styles.bigTitle}>{sel.nom}</Text>
          <Text style={styles.cultivarQ}>{sel.cultivarQ}</Text>
          <Text style={styles.latinType}>{sel.latin} · {sel.type}</Text>
        </View>

        {/* Pastilles cycle + viabilité */}
        <View style={styles.pillRow}>
          <Pill label={sel.cycleLabel} color={sel.cycleColor} soft={sel.cycleSoft} dot style={styles.bigPill} />
          <Pill label={`${sel.vlabel} · ${sel.vsub}`} color={sel.vcolor} soft={sel.vsoft} style={styles.bigPill} />
        </View>

        {/* Grille 2×2 */}
        <View style={styles.grid}>
          <GridItem label="Récolte" value={sel.recolte} />
          <GridItem label="Quantité" value={`${sel.qtyFmt} graines`} />
          <GridItem label="Stockage" value={sel.stockage} />
          <GridItem label="Origine" value={sel.origine} />
        </View>

        {/* Jauge de germination */}
        <Card style={styles.blockCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Gauge value={sel.germ} color={sel.germColor} />
            <View style={{ flex: 1 }}>
              <Text style={styles.blockTitle}>Taux de germination mesuré</Text>
              <Text style={styles.blockSub}>Viabilité {sel.germLabel} · dernier test {sel.recolte}</Text>
              <View style={styles.softBtn}>
                <Text style={styles.softBtnText}>Tester un échantillon</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Durée de conservation */}
        <Card style={styles.blockCard}>
          <View style={styles.blockHeadRow}>
            <Text style={styles.blockTitle}>Durée de conservation</Text>
            <View style={[styles.tinyPill, { backgroundColor: sel.vsoft }]}>
              <Text style={[styles.tinyPillText, { color: sel.vcolor }]}>{sel.vlabel}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <Text style={styles.longLabel}>{sel.longLabel}</Text>
            <Text style={styles.blockSub}>de faculté germinative</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: sel.consW, backgroundColor: sel.vcolor }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 }}>
            <Text style={styles.barFoot}>Récolte {sel.recolte} · {sel.yearsStored} an(s) en stock</Text>
            <Text style={[styles.barFoot, { color: sel.vcolor, fontFamily: fonts.sansSemi }]}>{sel.vsub}</Text>
          </View>
        </Card>

        {/* Fenêtre de semis */}
        <Card style={styles.blockCard}>
          <View style={styles.blockHeadRow}>
            <Text style={styles.blockTitle}>Fenêtre de semis</Text>
            <Text style={styles.semisLabel}>{sel.semisLabel}</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <MonthCells sd={sel.sd} se={sel.se} current={CURRENT_MONTH} activeColor={sel.familyColor} />
          </View>
          <View style={styles.monthLetters}>
            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((l, i) => (
              <Text key={i} style={styles.monthLetter}>{l}</Text>
            ))}
          </View>
          <Text style={styles.recolteEst}>
            Récolte estimée · <Text style={{ color: colors.text, fontFamily: fonts.sansMedium }}>{sel.recolteMois}</Text>
          </Text>
        </Card>

        {/* Classification botanique */}
        <View style={styles.section}>
          <SectionLabel style={{ marginBottom: 9 }}>Classification botanique</SectionLabel>
          <Card style={{ paddingHorizontal: 16 }}>
            <DataRow label="Embranchement" value={sel.embr} />
            <DataRow label="Classe" value={sel.classe} />
            <DataRow label="Ordre" value={sel.ordre} />
            <DataRow label="Famille" value={sel.famille} />
            <DataRow label="Genre" value={sel.genre} italic />
            <DataRow label="Espèce" value={sel.espece} italic />
            <DataRow label="Variété" value={sel.cultivar} last />
          </Card>
        </View>

        {/* Caractéristiques de culture */}
        <Card style={[styles.blockCard, { paddingHorizontal: 16, paddingVertical: 4 }]}>
          <DataRow label="Profondeur de semis" value={sel.profondeur} muted />
          <DataRow label="Levée" value={sel.levee} muted />
          <DataRow label="Espacement" value={sel.espacement} muted last />
        </Card>

        {/* Récupérer ses graines */}
        <View style={styles.section}>
          <SectionLabel style={{ marginBottom: 9 }}>Récupérer ses graines</SectionLabel>
          <Card style={{ padding: 16 }}>
            <View style={styles.blockHeadRow}>
              <Text style={styles.blockTitle}>Difficulté de récupération</Text>
              <View style={[styles.tinyPill, { backgroundColor: sel.diffSoft }]}>
                <Text style={[styles.tinyPillText, { color: sel.diffColor }]}>{sel.diffLabel}</Text>
              </View>
            </View>
            <Text style={styles.diffNote}>{sel.diffNote}</Text>

            {/* Onglets Récolte / Tri / Germination */}
            <View style={styles.guideTabs}>
              {GUIDE_TABS.map((t) => {
                const active = guideTab === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.guideTab, active && { backgroundColor: colors.primary }]}
                    onPress={() => setGuideTab(t.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.guideTabText, { color: active ? colors.surfaceAlt : colors.textSubtle }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Étapes numérotées */}
            <View style={{ gap: 14, marginTop: 16 }}>
              {guideSteps.map((st, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{st.t}</Text>
                    <Text style={styles.stepDetail}>{st.d}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Historique de récupération */}
        <View style={styles.section}>
          <SectionLabel style={{ marginBottom: 9 }}>Historique de récupération</SectionLabel>
          {history.length > 0 ? (
            <View style={{ gap: 9 }}>
              {history.map((h) => {
                const st = STATUS_VIEW[h.status];
                return (
                  <Card key={h.id} style={{ paddingVertical: 12, paddingHorizontal: 13 }}>
                    <View style={styles.blockHeadRow}>
                      <Text style={styles.histDate}>{h.dateLabel}</Text>
                      <View style={[styles.tinyPill, { backgroundColor: st.soft }]}>
                        <Text style={[styles.tinyPillText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.histMeta}>{h.methode} · {h.qte.toLocaleString('fr-FR')} graines récupérées</Text>
                  </Card>
                );
              })}
            </View>
          ) : (
            <View style={styles.noHistory}>
              <Text style={styles.noHistoryText}>Aucune récupération enregistrée pour cette variété.</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <SectionLabel>Notes</SectionLabel>
          <Text style={styles.notes}>{sel.notes}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => nav.navigate('NoterRecolte', { seedId: sel.id })}
          >
            <Text style={styles.primaryBtnText}>Noter une récolte</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            activeOpacity={0.7}
            onPress={() => nav.navigate('Ajout', { editId: sel.id })}
          >
            <Text style={styles.outlineBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ImageSearchModal
        visible={imgOpen}
        initialQuery={sel.latin}
        onClose={() => setImgOpen(false)}
        onPick={(url) => {
          setPhoto(sel.id, url);
          setImgOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const STATUS_VIEW: Record<string, { label: string; color: string; soft: string }> = {
  stocke: { label: 'Séché & stocké', color: '#4F7A3F', soft: '#E3EBD6' },
  sechage: { label: 'Séchage en cours', color: '#B08A2E', soft: '#F1E7CF' },
  trier: { label: 'À trier', color: '#BC6A43', soft: '#F3E2D5' },
};

function GridItem({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.gridItem}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={styles.gridValue}>{value}</Text>
    </Card>
  );
}

function DataRow({
  label,
  value,
  italic,
  last,
  muted,
}: {
  label: string;
  value: string;
  italic?: boolean;
  last?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={[styles.dataRow, last && { borderBottomWidth: 0 }]}>
      <Text style={[styles.dataLabel, muted && { fontSize: 13 }]}>{label}</Text>
      <Text style={[styles.dataValue, italic && { fontFamily: fonts.serifItalic }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  hero: {
    marginHorizontal: spacing.screenH,
    marginTop: 6,
    height: 172,
    borderRadius: radius.hero,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholder: { fontFamily: 'monospace', fontSize: 12, letterSpacing: 0.5, opacity: 0.8 },
  heroFamPill: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
  },
  heroFamText: { fontFamily: fonts.sansSemi, fontSize: 11 },
  imgBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: 'rgba(252,250,245,0.95)',
  },
  imgBtnText: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.primary },
  bigTitle: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 30, color: colors.text },
  cultivarQ: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.textSubtle, marginTop: 2 },
  latinType: { fontFamily: fonts.serifItalic, fontSize: 13, color: colors.textFaint, marginTop: 6 },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingHorizontal: spacing.screenH, paddingTop: 13 },
  bigPill: { paddingVertical: 6, paddingHorizontal: 11 },
  grid: {
    paddingHorizontal: spacing.screenH,
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.cardGap,
  },
  gridItem: { width: '47.6%', flexGrow: 1, paddingVertical: 12, paddingHorizontal: 13, borderRadius: radius.smallCard },
  gridLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  gridValue: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.text, marginTop: 5 },
  blockCard: { marginHorizontal: spacing.screenH, marginTop: 16, padding: 16 },
  blockHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockTitle: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.text },
  blockSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  softBtn: {
    alignSelf: 'flex-start',
    marginTop: 9,
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  softBtnText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.primary },
  tinyPill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  tinyPillText: { fontFamily: fonts.sansSemi, fontSize: 10.5 },
  longLabel: { fontFamily: fonts.serif, fontSize: 24, color: colors.text },
  barTrack: { height: 8, borderRadius: 5, backgroundColor: colors.track, overflow: 'hidden', marginTop: 12 },
  barFill: { height: '100%', borderRadius: 5 },
  barFoot: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textMuted },
  semisLabel: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.primaryDim },
  monthLetters: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 1 },
  monthLetter: { fontFamily: fonts.sans, fontSize: 9, color: colors.navInactive, flex: 1, textAlign: 'center' },
  recolteEst: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 11,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  section: { marginHorizontal: spacing.screenH, marginTop: 18 },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
  },
  dataLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, flexShrink: 1 },
  dataValue: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.text, textAlign: 'right', flexShrink: 1, marginLeft: 12 },
  diffNote: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 7, lineHeight: 18 },
  guideTabs: { flexDirection: 'row', gap: 4, marginTop: 14, backgroundColor: colors.trackAlt, borderRadius: radius.field, padding: 4 },
  guideTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 9 },
  guideTabText: { fontFamily: fonts.sansSemi, fontSize: 12.5 },
  stepNum: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.primary },
  stepTitle: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.text },
  stepDetail: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSubtle2, marginTop: 3, lineHeight: 18.5 },
  histDate: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.text },
  histMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 5 },
  noHistory: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(80,60,30,0.18)',
    borderRadius: radius.smallCard,
    padding: 16,
    alignItems: 'center',
  },
  noHistoryText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textFaint, textAlign: 'center' },
  notes: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21.7, color: colors.textStrong, marginTop: 7 },
  actions: { flexDirection: 'row', gap: 11, paddingHorizontal: spacing.screenH, paddingTop: 20 },
  primaryBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.smallCard, alignItems: 'center' },
  primaryBtnText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.onPrimary },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.smallCard,
    alignItems: 'center',
  },
  outlineBtnText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.primary },
});
