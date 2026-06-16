/**
 * Écran temporaire — sera remplacé par l'implémentation réelle après validation
 * du socle (thème + navigation + Catalogue + Fiche détail).
 */
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, fonts, spacing } from '../theme/tokens';

export function makePlaceholder(title: string, subtitle: string, withBack = false) {
  return function PlaceholderScreen() {
    const nav = useNavigation<any>();
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {withBack && (
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => nav.goBack()} style={styles.roundBtn} activeOpacity={0.7}>
              <Icon name="back" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.topTitle}>{title}</Text>
            <View style={{ width: 38 }} />
          </View>
        )}
        <View style={styles.center}>
          {!withBack && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.sub}>{subtitle}</Text>
          <Text style={styles.note}>À implémenter après validation du socle.</Text>
        </View>
      </SafeAreaView>
    );
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
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
  topTitle: { fontFamily: fonts.serif, fontSize: 21, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.screenH, gap: 8 },
  title: { fontFamily: fonts.serif, fontSize: 25, color: colors.text },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  note: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint, marginTop: 4 },
});
