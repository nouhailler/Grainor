/**
 * Jeu d'icônes outline (README §2.3 — trait 1.7–1.9, pas d'emoji).
 * Transcrites des SVG inline du prototype.
 */
import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'settings'
  | 'search'
  | 'back'
  | 'plus'
  | 'home'
  | 'list'
  | 'harvest'
  | 'box'
  | 'calendar'
  | 'alert'
  | 'sparkle'
  | 'camera'
  | 'close'
  | 'dots'
  | 'scan'
  | 'check'
  | 'chevron';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = '#2B271F', strokeWidth = 1.8 }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 24 24' };
  const stroke = { stroke: color, strokeWidth, fill: 'none' as const };
  const cap = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'settings':
      return (
        <Svg {...common}>
          <Line x1="4" y1="8" x2="20" y2="8" {...stroke} strokeLinecap="round" />
          <Circle cx="15" cy="8" r="2.3" {...stroke} />
          <Line x1="4" y1="16" x2="20" y2="16" {...stroke} strokeLinecap="round" />
          <Circle cx="9" cy="16" r="2.3" {...stroke} />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx="11" cy="11" r="7" {...stroke} />
          <Line x1="16.5" y1="16.5" x2="21" y2="21" {...stroke} strokeLinecap="round" />
        </Svg>
      );
    case 'back':
      return (
        <Svg {...common}>
          <Path d="M15 5l-7 7 7 7" {...stroke} {...cap} strokeWidth={2} />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...common}>
          <Line x1="12" y1="6" x2="12" y2="18" {...stroke} strokeLinecap="round" strokeWidth={strokeWidth} />
          <Line x1="6" y1="12" x2="18" y2="12" {...stroke} strokeLinecap="round" strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M4 11.5 12 5l8 6.5" {...stroke} {...cap} />
          <Path d="M6 10.5V19h12v-8.5" {...stroke} strokeLinejoin="round" />
        </Svg>
      );
    case 'list':
      return (
        <Svg {...common}>
          <Circle cx="5" cy="7" r="1.3" fill={color} />
          <Line x1="9" y1="7" x2="20" y2="7" {...stroke} strokeLinecap="round" />
          <Circle cx="5" cy="12" r="1.3" fill={color} />
          <Line x1="9" y1="12" x2="20" y2="12" {...stroke} strokeLinecap="round" />
          <Circle cx="5" cy="17" r="1.3" fill={color} />
          <Line x1="9" y1="17" x2="20" y2="17" {...stroke} strokeLinecap="round" />
        </Svg>
      );
    case 'harvest':
      return (
        <Svg {...common}>
          <Path d="M4 13v5a1 1 0 001 1h14a1 1 0 001-1v-5" {...stroke} {...cap} strokeWidth={1.7} />
          <Path d="M12 4v9" {...stroke} strokeLinecap="round" strokeWidth={1.7} />
          <Path d="M8.5 9.5 12 13l3.5-3.5" {...stroke} {...cap} strokeWidth={1.7} />
        </Svg>
      );
    case 'box':
      return (
        <Svg {...common}>
          <Path d="M3 8l9-4 9 4-9 4-9-4Z" {...stroke} strokeLinejoin="round" strokeWidth={1.7} />
          <Path d="M3 8v8l9 4 9-4V8" {...stroke} strokeLinejoin="round" strokeWidth={1.7} />
          <Path d="M12 12v8" {...stroke} strokeWidth={1.7} />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg {...common}>
          <Rect x="4" y="5" width="16" height="15" rx="2.5" {...stroke} strokeWidth={1.7} />
          <Line x1="4" y1="9.5" x2="20" y2="9.5" {...stroke} strokeWidth={1.7} />
          <Line x1="8" y1="3" x2="8" y2="6" {...stroke} strokeLinecap="round" strokeWidth={1.7} />
          <Line x1="16" y1="3" x2="16" y2="6" {...stroke} strokeLinecap="round" strokeWidth={1.7} />
        </Svg>
      );
    case 'alert':
      return (
        <Svg {...common}>
          <Path d="M12 4 3 19h18L12 4Z" {...stroke} strokeLinejoin="round" strokeWidth={1.9} />
          <Line x1="12" y1="10" x2="12" y2="14" {...stroke} strokeLinecap="round" strokeWidth={1.9} />
          <Circle cx="12" cy="16.6" r="0.7" fill={color} />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg {...common}>
          <Path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z" fill={color} />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...common}>
          <Path d="M4 8V6a2 2 0 012-2h2" {...stroke} strokeWidth={1.6} />
          <Path d="M16 4h2a2 2 0 012 2v2" {...stroke} strokeWidth={1.6} />
          <Path d="M20 16v2a2 2 0 01-2 2h-2" {...stroke} strokeWidth={1.6} />
          <Path d="M8 20H6a2 2 0 01-2-2v-2" {...stroke} strokeWidth={1.6} />
          <Circle cx="12" cy="12" r="3.2" {...stroke} strokeWidth={1.6} />
        </Svg>
      );
    case 'scan':
      return (
        <Svg {...common}>
          <Path d="M4 8V6a2 2 0 012-2h2" {...stroke} strokeWidth={1.6} />
          <Path d="M16 4h2a2 2 0 012 2v2" {...stroke} strokeWidth={1.6} />
          <Path d="M20 16v2a2 2 0 01-2 2h-2" {...stroke} strokeWidth={1.6} />
          <Path d="M8 20H6a2 2 0 01-2-2v-2" {...stroke} strokeWidth={1.6} />
          <Circle cx="12" cy="12" r="3.2" {...stroke} strokeWidth={1.6} />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...common}>
          <Line x1="6" y1="6" x2="18" y2="18" {...stroke} strokeLinecap="round" strokeWidth={2} />
          <Line x1="18" y1="6" x2="6" y2="18" {...stroke} strokeLinecap="round" strokeWidth={2} />
        </Svg>
      );
    case 'dots':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="5" r="1.6" fill={color} />
          <Circle cx="12" cy="12" r="1.6" fill={color} />
          <Circle cx="12" cy="19" r="1.6" fill={color} />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M5 12.5l4.5 4.5L19 7" {...stroke} {...cap} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'chevron':
      return (
        <Svg {...common}>
          <Path d="M9 6l6 6-6 6" {...stroke} {...cap} strokeWidth={strokeWidth} />
        </Svg>
      );
    default:
      return null;
  }
}
