/**
 * Anneau de germination (équivalent du conic-gradient du prototype).
 * Affiche le pourcentage au centre, l'arc coloré proportionnel au taux.
 */
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme/tokens';

export function Gauge({
  value,
  color,
  size = 78,
  stroke = 11,
}: {
  value: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* piste */}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.cellOff} strokeWidth={stroke} fill="none" />
        {/* arc rempli — départ en haut */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.text }}>{value}%</Text>
    </View>
  );
}
