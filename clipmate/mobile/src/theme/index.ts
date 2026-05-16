export const theme = {
  colors: {
    bg: "#0A0A0A",
    surface: "#141414",
    surfaceLight: "#1E1E1E",
    border: "#2A2A2A",
    primary: "#D4AF37",    // Gold
    primaryDim: "#8B7530",
    accent: "#C9A84C",
    success: "#2ECC71",
    error: "#E74C3C",
    warning: "#F39C12",
    text: "#F5F5F5",
    textDim: "#888888",
    textMuted: "#555555",
    white: "#FFFFFF",
    black: "#000000",
    pro: "#D4AF37",
    premium: "#E74C3C",
    free: "#555555",
    plus: "#3498DB",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 40,
  },
  shadows: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
