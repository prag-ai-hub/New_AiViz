import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

export function QueuePositionPill({ position }: { position: number }) {
  const { colors } = useTheme();
  if (position <= 0) return null;
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: colors.muted }]}>
        📍 #{position} in queue
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 3,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  text: {
    fontSize: tokens.fontSize.xs,
    fontWeight: "500",
  },
});
