/**
 * 4.7 Ajouter une graine — assistant IA (OpenRouter) + scan + saisie manuelle.
 * La proposition de l'IA est une AIDE : elle pré-remplit le formulaire, l'utilisateur valide.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Dot, SectionLabel, TopBar } from '../components/ui';
import { GUIDES, RawSeed, SeedGuide } from '../data/seeds';
import { aiStepsToGuide, AIProposal, askOpenRouter } from '../logic/ai';
import { DIFF, DiffKey } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors, CYCLE, CycleKey, FAMS, fonts, spacing } from '../theme/tokens';

const CYCLE_KEYS = Object.keys(CYCLE) as CycleKey[];

interface Form {
  nom: string;
  cultivar: string;
  latin: string;
  famille: string;
  cycle: CycleKey;
  duree: string;
  recolte: string;
  qty: string;
  stockage: string;
  germ: string;
  origine: string;
}

const EMPTY: Form = {
  nom: '', cultivar: '', latin: '', famille: '', cycle: 'annuelle',
  duree: '', recolte: '', qty: '', stockage: '', germ: '', origine: '',
};

export function AjoutScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Ajout'>>();
  const initialQuery = route.params?.query ?? '';
  const editId = route.params?.editId;
  const { apiKey, aiModel, seeds, rawSeeds, addSeed, updateSeed } = useApp();

  // Mode édition : on part de la variété existante et on préserve ses champs structurés.
  const original = useMemo(() => rawSeeds.find((s) => s.id === editId), [rawSeeds, editId]);
  const editMode = original != null;

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [proposalOpen, setProposalOpen] = useState(false);
  const [aiData, setAiData] = useState<AIProposal | null>(null); // payload IA conservé pour l'enregistrement
  const [form, setForm] = useState<Form>(() =>
    original
      ? {
          nom: original.nom,
          cultivar: original.cultivar === '—' ? '' : original.cultivar,
          latin: original.latin === '—' ? '' : original.latin,
          famille: original.famille,
          cycle: original.cycle,
          duree: original.longMin === original.longMax ? `${original.longMax}` : `${original.longMin}-${original.longMax}`,
          recolte: original.recolte === '—' ? '' : original.recolte,
          qty: original.qty ? String(original.qty) : '',
          stockage: original.stockage === '—' ? '' : original.stockage,
          germ: original.germ ? String(original.germ) : '',
          origine: original.origine,
        }
      : EMPTY,
  );

  const [customFamily, setCustomFamily] = useState(original && !FAMS[original.famille] ? original.famille : '');

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Chips de famille : les 9 familles connues + la famille courante si elle est personnalisée.
  const familyChips = useMemo(() => {
    const base = Object.keys(FAMS);
    return form.famille && !base.includes(form.famille) ? [...base, form.famille] : base;
  }, [form.famille]);

  const runAI = async (nameArg?: string) => {
    if (!apiKey) {
      setAiError('Ajoutez votre clé OpenRouter dans les Paramètres.');
      return;
    }
    const name = (nameArg ?? query).trim();
    if (!name) return;
    setLoading(true);
    setAiError('');
    setProposalOpen(false);
    try {
      const p = await askOpenRouter(name, apiKey, aiModel);
      setAiData(p);
      setProposalOpen(true);
    } catch (e: any) {
      setAiError(e?.message || 'Échec de la requête.');
    } finally {
      setLoading(false);
    }
  };

  // Arrivée depuis le Catalogue (« créer avec l'IA ») : lance le remplissage automatiquement.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    if (initialQuery && apiKey && !editMode) {
      autoRan.current = true;
      runAI(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, apiKey, editMode]);

  // Remplit le formulaire visible depuis la proposition (les champs structurés restent dans aiData).
  const applyProposal = () => {
    const p = aiData;
    if (!p) return;
    const cy = (p.cycle || '').toLowerCase();
    const cycle = (CYCLE_KEYS.find((k) => k === cy) ?? 'annuelle') as CycleKey;
    setForm((f) => ({
      ...f,
      nom: p.nom || f.nom,
      cultivar: p.cultivar || f.cultivar,
      latin: p.latin || f.latin,
      famille: (p.famille || '').trim() || f.famille,
      cycle,
      duree: p.dureeMin != null && p.dureeMax != null ? `${p.dureeMin}-${p.dureeMax}` : f.duree,
      germ: p.germination != null ? String(p.germination) : f.germ,
      origine: p.origine || f.origine,
    }));
    const fam = (p.famille || '').trim();
    setCustomFamily(fam && !FAMS[fam] ? fam : '');
    setProposalOpen(false);
  };

  const canSave = form.nom.trim() !== '' && form.famille !== '';

  const save = () => {
    if (!canSave) return;
    const [dMin, dMax] = parseDuree(form.duree);
    const p = aiData;
    // Repli : guide porté par la variété, sinon guide de démo (GUIDES) en édition.
    const guideFallback = original ? original.guide ?? GUIDES[original.id] : undefined;
    const guide = buildGuide(p, guideFallback);

    // Champs structurés : priorité au payload IA, puis à la variété d'origine (édition), puis défaut.
    const pick = (ai: any, orig: any, def = '—') =>
      ai != null && ai !== '' ? String(ai) : orig != null && orig !== '' ? String(orig) : def;

    const id = editMode ? original!.id : Math.max(0, ...seeds.map((s) => s.id)) + 1;
    const seed: RawSeed = {
      id,
      nom: form.nom.trim(),
      cultivar: form.cultivar.trim() || '—',
      latin: form.latin.trim() || '—',
      famille: form.famille,
      classe: pick(p?.classe, original?.classe),
      ordre: pick(p?.ordre, original?.ordre),
      genre: pick(p?.genre, original?.genre),
      espece: pick(p?.espece, original?.espece),
      cycle: form.cycle,
      sd: clampMonth(p?.semisDebut, original?.sd ?? 3),
      se: clampMonth(p?.semisFin, original?.se ?? 4),
      rd: clampMonth(p?.recolteDebut, original?.rd ?? 7),
      re: clampMonth(p?.recolteFin, original?.re ?? 9),
      qty: parseInt(form.qty, 10) || 0,
      germ: parseInt(form.germ, 10) || p?.germination || 0,
      recolte: form.recolte.trim() || '—',
      recolteAnnee: parseAnnee(form.recolte) || original?.recolteAnnee || 2026,
      longMin: dMin,
      longMax: dMax,
      origine: form.origine.trim() || 'Saisie manuelle',
      zone: original?.zone ?? 'A',
      stockage: form.stockage.trim() || '—',
      type: pick(p?.type, original?.type),
      profondeur: pick(p?.profondeur, original?.profondeur),
      levee: pick(p?.levee, original?.levee),
      espacement: pick(p?.espacement, original?.espacement),
      recolteMois: pick(p?.recolteMois, original?.recolteMois),
      notes: form.nom && p?.reproduction ? p.reproduction : original?.notes ?? '',
      guide,
    };
    if (editMode) updateSeed(seed);
    else addSeed(seed);
    nav.navigate('Detail', { seedId: id });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title={editMode ? 'Modifier la variété' : 'Ajouter une graine'} onBack={() => nav.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.screenH, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {!editMode && (
          <>
        {/* Assistant IA */}
        <View style={styles.aiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="sparkle" size={18} color={colors.seedDot} />
            <Text style={styles.aiTitle}>Assistant IA</Text>
          </View>
          <Text style={styles.aiDesc}>
            Saisissez une variété : l'IA pré‑remplit la fiche (modèles gratuits, clé locale).
          </Text>
          <View style={styles.aiRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ex. Tomate Cœur de Bœuf"
              placeholderTextColor={colors.onPrimaryFaint}
              style={styles.aiInput}
              onSubmitEditing={() => runAI()}
            />
          </View>
          {apiKey ? (
            <TouchableOpacity style={styles.aiBtn} activeOpacity={0.85} onPress={() => runAI()} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.aiBtnText}>Remplir automatiquement</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.aiBtn} activeOpacity={0.85} onPress={() => nav.navigate('Parametres')}>
              <Text style={styles.aiBtnText}>Configurer la clé IA</Text>
            </TouchableOpacity>
          )}
          {!!aiError && <Text style={styles.aiError}>{aiError}</Text>}
        </View>

        {/* Proposition IA à valider */}
        {proposalOpen && aiData && (
          <View style={styles.proposalCard}>
            <SectionLabel>Proposition de l'IA</SectionLabel>
            <Text style={styles.proposalNom}>
              {aiData.nom} <Text style={styles.proposalCultivar}>{aiData.cultivar}</Text>
            </Text>
            {!!aiData.latin && <Text style={styles.proposalLatin}>{aiData.latin}</Text>}
            <View style={styles.proposalGrid}>
              {aiData.famille ? <ProposalChip label={aiData.famille} /> : null}
              {aiData.cycle ? <ProposalChip label={aiData.cycle} /> : null}
              {aiData.germination != null ? <ProposalChip label={`Germ. ${aiData.germination}%`} /> : null}
              {aiData.difficulte ? <ProposalChip label={`Récup. ${aiData.difficulte.toLowerCase()}`} /> : null}
              {aiData.dureeMin != null ? <ProposalChip label={`${aiData.dureeMin}–${aiData.dureeMax} ans`} /> : null}
            </View>
            {!!aiData.reproduction && <Text style={styles.proposalNote}>{aiData.reproduction}</Text>}
            <Text style={styles.proposalFoot}>
              Classification, culture et guide (récolte · tri · germination) seront aussi renseignés.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.useBtn} activeOpacity={0.85} onPress={applyProposal}>
                <Text style={styles.useBtnText}>Utiliser cette proposition</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dismissBtn}
                activeOpacity={0.7}
                onPress={() => {
                  setProposalOpen(false);
                  setAiData(null);
                }}
              >
                <Text style={styles.dismissText}>Ignorer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Séparateur */}
        <View style={styles.sep}>
          <View style={styles.sepLine} />
          <Text style={styles.sepText}>ou via le scan / saisie manuelle</Text>
          <View style={styles.sepLine} />
        </View>

        {/* Scan d'étiquette */}
        <View style={styles.scanBox}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Icon name="scan" size={26} color={colors.textMuted} />
          <Text style={styles.scanText}>Scanner une étiquette de sachet</Text>
        </View>
        <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
          <Icon name="camera" size={17} color={colors.text} />
          <Text style={styles.cameraText}>Ouvrir l'appareil photo</Text>
        </TouchableOpacity>
          </>
        )}

        {/* Formulaire manuel */}
        <Field label="Nom" value={form.nom} onChange={(v) => set('nom', v)} placeholder="Tomate" />
        <Field label="Variété (cultivar)" value={form.cultivar} onChange={(v) => set('cultivar', v)} placeholder="Cœur de Bœuf" />
        <Field label="Nom latin" value={form.latin} onChange={(v) => set('latin', v)} placeholder="Solanum lycopersicum" />

        <SectionLabel style={[styles.fieldLabel, { marginTop: 16 }]}>Famille</SectionLabel>
        <View style={styles.wrapRow}>
          {familyChips.map((f) => {
            const active = form.famille === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.7}
                onPress={() => {
                  set('famille', f);
                  setCustomFamily('');
                }}
                style={[styles.famChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong }]}
              >
                <Dot color={active ? colors.onPrimary : FAMS[f] ?? colors.textFaint} size={7} />
                <Text style={[styles.famChipText, { color: active ? colors.onPrimary : colors.textBody }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          value={customFamily}
          onChangeText={(v) => {
            setCustomFamily(v);
            set('famille', v.trim());
          }}
          placeholder="Autre famille — à créer (ex. Rosacées)…"
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, { marginTop: 8 }]}
          autoCapitalize="words"
        />
        {form.famille !== '' && !FAMS[form.famille] && (
          <Text style={styles.customFamHint}>Nouvelle famille « {form.famille} » (couleur neutre).</Text>
        )}

        <SectionLabel style={[styles.fieldLabel, { marginTop: 16 }]}>Cycle</SectionLabel>
        <View style={styles.wrapRow}>
          {CYCLE_KEYS.map((k) => {
            const active = form.cycle === k;
            return (
              <TouchableOpacity
                key={k}
                activeOpacity={0.7}
                onPress={() => set('cycle', k)}
                style={[styles.famChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong }]}
              >
                <Text style={[styles.famChipText, { color: active ? colors.onPrimary : colors.textBody }]}>{CYCLE[k].label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 11 }}>
          <View style={{ flex: 1 }}>
            <Field label="Durée germinative (ans)" value={form.duree} onChange={(v) => set('duree', v)} placeholder="4-6" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Germination (%)" value={form.germ} onChange={(v) => set('germ', v)} placeholder="92" keyboard="number-pad" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 11 }}>
          <View style={{ flex: 1 }}>
            <Field label="Date de récolte" value={form.recolte} onChange={(v) => set('recolte', v)} placeholder="Sept. 2024" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Quantité (gr)" value={form.qty} onChange={(v) => set('qty', v)} placeholder="240" keyboard="number-pad" />
          </View>
        </View>
        <Field label="Lieu de stockage" value={form.stockage} onChange={(v) => set('stockage', v)} placeholder="Étagère A · Bocal 2" />
        <Field label="Origine" value={form.origine} onChange={(v) => set('origine', v)} placeholder="Récolte maison" />

        <TouchableOpacity style={[styles.save, !canSave && styles.saveDisabled]} activeOpacity={0.85} disabled={!canSave} onPress={save}>
          <Text style={styles.saveText}>{editMode ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder, keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: 'number-pad';
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <SectionLabel style={styles.fieldLabel}>{label}</SectionLabel>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        keyboardType={keyboard}
        style={styles.input}
      />
    </View>
  );
}

function ProposalChip({ label }: { label: string }) {
  return (
    <View style={styles.propChip}>
      <Text style={styles.propChipText}>{label}</Text>
    </View>
  );
}

function parseDuree(s: string): [number, number] {
  const nums = (s.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  if (nums.length >= 2) return [nums[0], nums[1]];
  if (nums.length === 1) return [nums[0], nums[0]];
  return [3, 4];
}
function parseAnnee(s: string): number {
  const m = s.match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1], 10) : 2026;
}
/** Numéro de mois valide (1-12), sinon valeur par défaut. */
function clampMonth(v: any, def: number): number {
  const n = Math.round(+v);
  return Number.isFinite(n) && n >= 1 && n <= 12 ? n : def;
}
/** Construit le guide de récupération depuis la proposition IA (repli sur l'existant). */
function buildGuide(p: AIProposal | null, fallback?: SeedGuide): SeedGuide | undefined {
  const recolte = aiStepsToGuide(p?.guideRecolte);
  const tri = aiStepsToGuide(p?.guideTri);
  const germination = aiStepsToGuide(p?.guideGermination);
  if (!recolte.length && !tri.length && !germination.length) return fallback;
  const diff = (p?.difficulte && DIFF[p.difficulte as DiffKey] ? p.difficulte : fallback?.diff ?? 'Moyen') as DiffKey;
  return {
    diff,
    note: p?.reproduction || fallback?.note || "Renseignez le mode de reproduction et l'isolement.",
    recolte: recolte.length ? recolte : fallback?.recolte ?? [],
    tri: tri.length ? tri : fallback?.tri ?? [],
    germination: germination.length ? germination : fallback?.germination ?? [],
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  aiCard: { backgroundColor: colors.primary, borderRadius: 18, padding: 16, marginTop: 6 },
  aiTitle: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.onPrimary },
  aiDesc: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.onPrimaryDim, marginTop: 8, lineHeight: 18 },
  aiRow: { marginTop: 12 },
  aiInput: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.onPrimary,
  },
  aiBtn: { marginTop: 10, backgroundColor: colors.seedDot, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  aiBtnText: { fontFamily: fonts.sansBold, fontSize: 14, color: '#243A2B' },
  aiError: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: '#F1D7C5', marginTop: 10 },
  proposalCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 16, padding: 15, marginTop: 14 },
  proposalNom: { fontFamily: fonts.serif, fontSize: 19, color: colors.text, marginTop: 8 },
  proposalCultivar: { fontFamily: fonts.serifItalic, fontSize: 14, color: colors.textFaint },
  proposalLatin: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textFaint, marginTop: 2 },
  proposalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  proposalNote: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSubtle2, marginTop: 11, lineHeight: 18 },
  proposalFoot: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textFaint, marginTop: 10, lineHeight: 16 },
  propChip: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 11 },
  propChipText: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.textSubtle },
  useBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  useBtnText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.onPrimary },
  dismissBtn: { paddingHorizontal: 16, justifyContent: 'center' },
  dismissText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.textMuted },
  sep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  sepLine: { flex: 1, height: 1, backgroundColor: colors.borderStrong },
  sepText: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  scanBox: {
    height: 130,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: colors.primaryDim },
  cornerTL: { top: 14, left: 14, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 },
  scanText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.textMuted },
  cameraBtn: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingVertical: 13,
  },
  cameraText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.text },
  fieldLabel: { marginBottom: 9 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  famChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1 },
  famChipText: { fontFamily: fonts.sansSemi, fontSize: 12.5 },
  customFamHint: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.primaryDim, marginTop: 7 },
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
  save: { marginTop: 24, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveDisabled: { opacity: 0.45 },
  saveText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onPrimary },
});
