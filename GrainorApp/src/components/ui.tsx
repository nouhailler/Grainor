/**
 * Primitives d'UI partagées, dérivées du système de design (README §2).
 */
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, hexA, radius } from '../theme/tokens';
import { Icon } from './Icon';

/** Pastille pleine de couleur (point famille / cycle / statut). */
export function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

/** Pastille / chip (pilule) avec libellé coloré, point optionnel. */
export function Pill({
  label,
  color,
  soft,
  dot = false,
  style,
}: {
  label: string;
  color: string;
  soft?: string;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 3,
          paddingHorizontal: 8,
          borderRadius: 20,
          backgroundColor: soft ?? hexA(color, 0.13),
        },
        style,
      ]}
    >
      {dot && <Dot color={color} size={6} />}
      <Text style={{ fontFamily: fonts.sansSemi, fontSize: 10.5, color }}>{label}</Text>
    </View>
  );
}

/** Carte standard : fond clair + bordure fine, pas d'ombre (README §2.3). */
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Libellé de section en MAJUSCULES (README §2.2). */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

/** Titre d'écran (serif). */
export function ScreenTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.screenTitle, style]}>{children}</Text>;
}

/** Barre de titre des écrans en pile : bouton retour + titre serif centré. */
export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.topbar}>
      <TouchableOpacity onPress={onBack} style={styles.roundBtn} activeOpacity={0.7}>
        <Icon name="back" size={18} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.topbarTitle}>{title}</Text>
      <View style={{ width: 38 }} />
    </View>
  );
}

/** Logo Grainor : « graine » verte inclinée avec point clair (cf. §2.4). */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.52,
        borderBottomLeftRadius: size * 0.22,
        backgroundColor: colors.primaryGradTo,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-12deg' }],
      }}
    >
      <View
        style={{
          width: size * 0.19,
          height: size * 0.19,
          borderRadius: size * 0.1,
          backgroundColor: colors.seedDot,
          transform: [{ rotate: '12deg' }],
        }}
      />
    </View>
  );
}

/** Frise de 12 cases (fenêtre de semis), mois courant entouré. */
export function MonthCells({
  sd,
  se,
  current,
  activeColor,
  height = 20,
}: {
  sd: number;
  se: number;
  current?: number;
  activeColor: string;
  height?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const idx = i + 1;
        const on = idx >= sd && idx <= se;
        const ring = idx === current;
        return (
          <View
            key={idx}
            style={{
              flex: 1,
              height,
              borderRadius: 4,
              backgroundColor: on ? activeColor : colors.cellOff,
              borderWidth: ring ? 2 : 0,
              borderColor: ring ? colors.primary : 'transparent',
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
  },
  sectionLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  screenTitle: {
    fontFamily: fonts.serif,
    fontSize: 25,
    color: colors.text,
  },
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
  topbarTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.text },
});
