import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

export function FeatureRow({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: tokens.spacing.sm, alignItems: "flex-start" }}>
      <Text style={{ color: colors.primary, fontWeight: tokens.fontWeight.bold }}>✓</Text>
      <Text variant="caption" style={{ flex: 1, color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}
