import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { ToolMeta } from "@/core/tools/registry";
import type { QuotaLimit } from "@/features/billing/types";
import { Text } from "@/shared/components/typography";

type Props = {
  tool: ToolMeta;
  limit?: QuotaLimit;
};

export function ToolCard({ tool }: Props) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => router.push(tool.href as never)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: "rgba(31,190,214,0.12)" },
        ]}
      >
        <Text style={{ fontSize: 22 }}>{tool.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.text, fontSize: tokens.fontSize.lg, fontWeight: "700" }}>
          {tool.name}
        </Text>
        <Text variant="caption" style={{ color: colors.muted }} numberOfLines={3}>
          {tool.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    flexDirection: "row",
    gap: tokens.spacing.md,
    minHeight: 130,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
