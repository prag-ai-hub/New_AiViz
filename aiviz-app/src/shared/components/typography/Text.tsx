import { Text as RNText, TextProps, TextStyle } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";

type Variant = "h1" | "h2" | "h3" | "body" | "caption";

const variants: Record<Variant, TextStyle> = {
  h1: { fontSize: tokens.fontSize["3xl"], fontWeight: tokens.fontWeight.bold },
  h2: { fontSize: tokens.fontSize["2xl"], fontWeight: tokens.fontWeight.bold },
  h3: { fontSize: tokens.fontSize.xl, fontWeight: tokens.fontWeight.semibold },
  body: { fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.regular },
  caption: { fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.regular },
};

export function Text({ variant = "body", style, ...rest }: TextProps & { variant?: Variant }) {
  const { colors } = useTheme();
  return <RNText style={[{ color: colors.text }, variants[variant], style]} {...rest} />;
}
