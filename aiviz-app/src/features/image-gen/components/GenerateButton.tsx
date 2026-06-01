import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function GenerateButton({ onPress, disabled, loading }: Props) {
  const { colors } = useTheme();
  const isOff = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isOff}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: isOff ? colors.border : colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryFg} />
      ) : (
        <Text style={{ fontSize: 16 }}>✨</Text>
      )}
      <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
        {loading ? "Generating…" : "Generate"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
});
