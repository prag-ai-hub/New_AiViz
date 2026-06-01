import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  icon: string;
  label: string;
  caption: string;
  onPress: () => void;
};

export function QuickLink({ icon, label, caption, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ color: colors.text, fontWeight: "600", marginTop: tokens.spacing.xs }}>
        {label}
      </Text>
      <Text variant="caption" style={{ color: colors.muted }}>
        {caption}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    minWidth: 140,
  },
});
