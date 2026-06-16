/**
 * 4.5 Inventaire — zones d'entreposage et remplissage (§6.4).
 */
import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Card, Dot, Pill } from '../components/ui';
import { ZONE_ORDER } from '../data/seeds';
import { zonesView } from '../logic/seeds';
import { useApp } from '../store/AppContext';
import { colors, fonts, fmt, spacing } from '../theme/tokens';

export function InventaireScreen() {
  const nav = useNavigation<any>();
  const { seeds } = useApp();
  const zones = useMemo(() => zonesView(seeds, ZONE_ORDER), [seeds]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Inventaire</Text>
          <Text style={styles.subtitle}>{zones.length} zones d'entreposage</Text>
        </View>

        <View style={styles.list}>
          {zones.map((z) => (
            <Card key={z.key} style={styles.zoneCard}>
              {/* En-tête de zone */}
              <View style={styles.zoneHead}>
                <View style={[styles.zoneIcon, { backgroundColor: z.colorSoft }]}>
                  <Icon name="box" size={20} color={z.color} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.zoneName} numberOfLines={1}>{z.name}</Text>
                  <Text style={styles.zoneCond}>{z.cond}</Text>
                </View>
                <Text style={styles.zoneVar}>{z.nbVar} var.</Text>
              </View>

              {/* Barre de remplissage */}
              <View style={styles.fillRow}>
                <View style={styles.fillTrack}>
                  <View style={[styles.fillBar, { width: `${z.fill}%`, backgroundColor: z.barColor }]} />
                </View>
                <Text style={[styles.fillPct, { color: z.barColor }]}>{z.fill}%</Text>
              </View>
              <Text style={styles.fillFoot}>{z.totalFmt} graines stockées</Text>

              {/* Variétés de la zone */}
              <View style={styles.items}>
                {z.items.map((s, i) => (
                  <TouchableOpacity
                    key={s.id}
                    activeOpacity={0.7}
                    onPress={() => nav.navigate('Detail', { seedId: s.id })}
                    style={[styles.itemRow, i > 0 && styles.itemDivider]}
                  >
                    <Dot color={s.familyColor} size={8} />
                    <Text style={styles.itemNom} numberOfLines={1}>
                      {s.nom} <Text style={styles.itemCultivar}>{s.cultivar}</Text>
                    </Text>
                    <Pill label={s.vlabel} color={s.vcolor} soft={s.vsoft} />
                    <Text style={styles.itemQty}>{s.qtyFmt} gr</Text>
                  </TouchableOpacity>
                ))}
                {z.items.length === 0 && <Text style={styles.zoneEmpty}>Aucune variété dans cette zone.</Text>}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.screenH, paddingTop: 12 },
  title: { fontFamily: fonts.serif, fontSize: 25, color: colors.text },
  subtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  list: { paddingHorizontal: spacing.screenH, gap: spacing.cardGap, marginTop: 16 },
  zoneCard: { padding: 14 },
  zoneHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoneIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  zoneName: { fontFamily: fonts.serif, fontSize: 16.5, color: colors.text },
  zoneCond: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  zoneVar: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.textMuted },
  fillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  fillTrack: { flex: 1, height: 9, borderRadius: 5, backgroundColor: colors.track, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: 5 },
  fillPct: { fontFamily: fonts.sansBold, fontSize: 12 },
  fillFoot: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
  items: { marginTop: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10 },
  itemDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  itemNom: { fontFamily: fonts.serif, fontSize: 15, color: colors.text, flex: 1, minWidth: 0 },
  itemCultivar: { fontFamily: fonts.serifItalic, fontSize: 11.5, color: colors.textFaint },
  itemQty: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.text, minWidth: 52, textAlign: 'right' },
  zoneEmpty: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textFaint, paddingVertical: 8 },
});
