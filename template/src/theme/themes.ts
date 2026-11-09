import {ThemeDef} from './types';
import {FONT_HEAVY, FONT_MONO, FONT_TECH, FONT_WIDE} from '../common/lib';

export const THEME_CYBER: ThemeDef = {
  id: 'cyber',
  name: 'Cyber Tech (Dark Neon)',
  description: 'Giao diện tối màu với lưới hạt dot-grid và điểm nhấn neon tím/xanh ngọc, phong cách hacker/developer hiện đại.',
  colors: {
    bg: '#08090D',
    surface: 'rgba(15, 18, 28, 0.85)',
    surfaceBorder: 'rgba(168, 85, 247, 0.35)',
    textPrimary: '#FFFFFF',
    textSecondary: '#E2E8F0',
    textMuted: '#94A3B8',
    accentPrimary: '#A855F7', // Neon Purple
    accentSecondary: '#10B981', // Emerald Green
    codeBg: 'rgba(10, 12, 18, 0.92)',
    codeBorder: 'rgba(255, 255, 255, 0.12)',
    gridColor: 'rgba(168, 85, 247, 0.15)',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    badgeBorder: 'rgba(168, 85, 247, 0.4)',
    badgeText: '#D8B4FE',
  },
  typography: {
    fontHeading: FONT_HEAVY,
    fontBody: FONT_HEAVY,
    fontMono: FONT_MONO,
    fontAccent: FONT_TECH,
  },
};

export const THEME_SWISS: ThemeDef = {
  id: 'swiss',
  name: 'Swiss Style (International Typographic)',
  description: 'Phong cách thiết kế Thụy Sĩ tối giản, nền sáng sang trọng, hệ lưới cột nghiêm ngặt với điểm nhấn đỏ Thụy Sĩ.',
  colors: {
    bg: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceBorder: '#E2E8F0',
    textPrimary: '#0F172A', // Slate 900
    textSecondary: '#334155', // Slate 700
    textMuted: '#64748B', // Slate 500
    accentPrimary: '#D32F2F', // Swiss Red
    accentSecondary: '#2563EB', // Bauhaus Blue
    codeBg: '#FFFFFF',
    codeBorder: '#CBD5E1',
    gridColor: 'rgba(15, 23, 42, 0.08)',
    badgeBg: 'rgba(211, 47, 47, 0.08)',
    badgeBorder: 'rgba(211, 47, 47, 0.3)',
    badgeText: '#B91C1C',
  },
  typography: {
    fontHeading: FONT_HEAVY,
    fontBody: FONT_HEAVY,
    fontMono: FONT_MONO,
    fontAccent: FONT_WIDE,
  },
};

export const THEME_BLUEPRINT: ThemeDef = {
  id: 'blueprint',
  name: 'Technical Blueprint (Architectural CAD)',
  description: 'Bản vẽ kỹ thuật xanh thẫm, các đường gióng tỷ lệ CAD, viền nét đứt và điểm nhấn cyan/amber sắc sảo.',
  colors: {
    bg: '#0A192F', // Deep CAD Navy
    surface: 'rgba(16, 36, 64, 0.9)',
    surfaceBorder: 'rgba(100, 255, 218, 0.35)',
    textPrimary: '#E6F1FF',
    textSecondary: '#CCD6F6',
    textMuted: '#8892B0',
    accentPrimary: '#64FFDA', // Blueprint Cyan
    accentSecondary: '#F59E0B', // Drafting Amber
    codeBg: 'rgba(10, 25, 47, 0.95)',
    codeBorder: 'rgba(100, 255, 218, 0.3)',
    gridColor: 'rgba(100, 255, 218, 0.15)',
    badgeBg: 'rgba(100, 255, 218, 0.12)',
    badgeBorder: 'rgba(100, 255, 218, 0.4)',
    badgeText: '#64FFDA',
  },
  typography: {
    fontHeading: FONT_WIDE,
    fontBody: FONT_HEAVY,
    fontMono: FONT_MONO,
    fontAccent: FONT_TECH,
  },
};

export const THEMES: Record<string, ThemeDef> = {
  cyber: THEME_CYBER,
  swiss: THEME_SWISS,
  blueprint: THEME_BLUEPRINT,
};

export function getTheme(id?: string): ThemeDef {
  return THEMES[id || 'cyber'] || THEME_CYBER;
}
