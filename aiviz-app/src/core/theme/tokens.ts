export type ThemeColors = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryFg: string;
  danger: string;
  success: string;
};

const light: ThemeColors = {
  bg: "#FFFFFF",
  surface: "#F7F7F8",
  text: "#0B0B0F",
  muted: "#6B7280",
  border: "#E5E7EB",
  primary: "#4F46E5",
  primaryFg: "#FFFFFF",
  danger: "#DC2626",
  success: "#16A34A",
};

const dark: ThemeColors = {
  bg: "#0A1929",      // deep navy
  surface: "#0F2440", // card / panel
  text: "#E5F2FF",    // off-white with cyan tint
  muted: "#7BA7C9",   // muted slate
  border: "#1FBED6",  // cyan glow (used on card outlines)
  primary: "#1FBED6", // cyan-teal accent
  primaryFg: "#061224", // text on primary buttons
  danger: "#F87171",
  success: "#4ADE80",
};

export const tokens = {
  colors: { light, dark },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 },
  radii: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, "2xl": 28, "3xl": 36 },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,
} as const;
