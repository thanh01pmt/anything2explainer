export type ThemeId = 'cyber' | 'swiss' | 'blueprint';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  codeBg: string;
  codeBorder: string;
  gridColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export interface ThemeTypography {
  fontHeading: string;
  fontBody: string;
  fontMono: string;
  fontAccent: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
}

