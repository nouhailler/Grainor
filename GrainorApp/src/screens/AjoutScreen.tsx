/**
 * 4.7 Ajouter une graine — assistant IA (OpenRouter) + scan + saisie manuelle.
 * La proposition de l'IA est une AIDE : elle pré-remplit le formulaire, l'utilisateur valide.
 */
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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
import { RawSeed } from '../data/seeds';
import { AIProposal, askOpenRouter } from '../logic/ai';
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
  const { apiKey, aiModel, seeds, addSeed } = useApp();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [proposal, setProposal] = useState<AIProposal | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const runAI = async () => {
    if (!apiKey) {
      setAiError('Ajoutez votre clé OpenRouter dans les Paramètres.');
      return;
    }
    const name = query.trim();
    if (!name) return;
    setLoading(true);
    setAiError('');
    setProposal(null);
    try {
      const p = await askOpenRouter(name, apiKey, aiModel);
      setProposal(p);
    } catch (e: any) {
      setAiError(e?.message || 'Échec de la requête.');
    } finally {
      setLoading(false);
    }
  };

  const applyProposal = () => {
    if (!proposal) return;
    const cy = (proposal.cycle || '').toLowerCase();
    const cycle = (CYCLE_KEYS.find((k) => k === cy) ?? 'annuelle') as CycleKey;
    setForm((f) => ({
      ...f,
      nom: proposal.nom || f.nom,
      cultivar: proposal.cultivar || f.cultivar,
      latin: proposal.latin || f.latin,
      famille: FAMS[proposal.famille || ''] ? proposal.famille! : f.famille,
      cycle,
      duree:
        proposal.dureeMin != null && proposal.dureeMax != null
          ? `${proposal.dureeMin}-${proposal.dureeMax}`
          : f.duree,
    }));
    setProposal(null);
  };

  const canSave = form.nom.trim() !== '' && form.famille !== '';

  const save = () => {
    if (!canSave) return;
    const [dMin, dMax] = parseDuree(form.duree);
    const nextId = Math.max(0, ...seeds.map((s) => s.id)) + 1;
    const seed: RawSeed = {
      id: nextId,
      nom: form.nom.trim(),
      cultivar: form.cultivar.trim() || '—',
      latin: form.latin.trim() || '—',
      famille: form.famille,
      classe: proposal?.classe || '—',
      ordre: proposal?.ordre || '—',
      genre: proposal?.genre || '—',
      espece: proposal?.espece || '—',
      cycle: form.cycle,
      sd: 3, se: 4, rd: 7, re: 9,
      qty: parseInt(form.qty, 10) || 0,
      germ: parseInt(form.germ, 10) || 0,
      recolte: form.recolte.trim() || '—',
      recolteAnnee: parseAnnee(form.recolte),
      longMin: dMin,
      longMax: dMax,
      origine: form.origine.trim() || 'Saisie manuelle',
      zone: 'A',
      stockage: form.stockage.trim() || '—',
      type: proposal?.type || '—',
      profondeur: proposal?.profondeur || '—',
      levee: proposal?.levee || '—',
      espacement: proposal?.espacement || '—',
      recolteMois: proposal?.recolteMois || '—',
      notes: proposal?.reproduction || '',
    };
    addSeed(seed);
    nav.navigate('Detail', { seedId: nextId });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="Ajouter une graine" onBack={() => nav.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.screenH, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
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
              onSubmitEditing={runAI}
            />
          </View>
          {apiKey ? (
            <TouchableOpacity style={styles.aiBtn} activeOpacity={0.85} onPress={runAI} disabled={loading}>
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
        {proposal && (
          <View style={styles.proposalCard}>
            <SectionLabel>Proposition de l'IA</SectionLabel>
            <Text style={styles.proposalNom}>
              {proposal.nom} <Text style={styles.proposalCultivar}>{proposal.cultivar}</Text>
            </Text>
            {!!proposal.latin && <Text style={styles.proposalLatin}>{proposal.latin}</Text>}
            <View style={styles.proposalGrid}>
              {proposal.famille ? <ProposalChip label={proposal.famille} /> : null}
              {proposal.cycle ? <ProposalChip label={proposal.cycle} /> : null}
              {proposal.difficulte ? <ProposalChip label={`Récup. ${proposal.difficulte.toLowerCase()}`} /> : null}
              {proposal.dureeMin != null ? <ProposalChip label={`${proposal.dureeMin}–${proposal.dureeMax} ans`} /> : null}
            </View>
            {!!proposal.reproduction && <Text style={styles.proposalNote}>{proposal.reproduction}</Text>}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.useBtn} activeOpacity={0.85} onPress={applyProposal}>
                <Text style={styles.useBtnText}>Utiliser cette proposition</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dismissBtn} activeOpacity={0.7} onPress={() => setProposal(null)}>
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

        {/* Formulaire manuel */}
        <Field label="Nom" value={form.nom} onChange={(v) => set('nom', v)} placeholder="Tomate" />
        <Field label="Variété (cultivar)" value={form.cultivar} onChange={(v) => set('cultivar', v)} placeholder="Cœur de Bœuf" />
        <Field label="Nom latin" value={form.latin} onChange={(v) => set('latin', v)} placeholder="Solanum lycopersicum" />

        <SectionLabel style={[styles.fieldLabel, { marginTop: 16 }]}>Famille</SectionLabel>
        <View style={styles.wrapRow}>
          {Object.keys(FAMS).map((f) => {
            const active = form.famille === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.7}
                onPress={() => set('famille', f)}
                style={[styles.famChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.borderStrong }]}
              >
                <Dot color={active ? colors.onPrimary : FAMS[f]} size={7} />
                <Text style={[styles.famChipText, { color: active ? colors.onPrimary : colors.textBody }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
          <Text style={styles.saveText}>Ajouter au catalogue</Text>
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
