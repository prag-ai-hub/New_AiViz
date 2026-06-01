import { ActivityIndicator, Pressable, PressableProps, ViewStyle } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Variant = "primary" | "secondary" | "ghost";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, variant = "primary", loading, disabled, style, ...rest }: Props) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bg: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.surface,
    ghost: "transparent",
  };
  const fg: Record<Variant, string> = {
    primary: colors.primaryFg,
    secondary: colors.text,
    ghost: colors.primary,
  };
  const border: Record<Variant, string> = {
    primary: "transparent",
    secondary: colors.border,
    ghost: "transparent",
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg[variant],
          borderColor: border[variant],
          borderWidth: variant === "secondary" ? 1 : 0,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          paddingVertical: tokens.spacing.md,
          paddingHorizontal: tokens.spacing.lg,
          borderRadius: tokens.radii.md,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: tokens.spacing.sm,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={fg[variant]} /> : null}
      <Text style={{ color: fg[variant], fontWeight: tokens.fontWeight.semibold }}>{label}</Text>
    </Pressable>
  );
}
