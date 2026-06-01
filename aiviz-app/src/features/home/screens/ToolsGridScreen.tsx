import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { TOOLS } from "@/core/tools/registry";
import { ToolCard } from "@/features/home/components";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function ToolsGridScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: tokens.spacing.md,
          paddingBottom: tokens.spacing["2xl"],
        }}
      >
        <View style={styles.titleRow}>
          <Text style={{ fontSize: 22 }}>🤖</Text>
          <Text variant="h1" style={{ color: colors.text }}>
            AI Tools
          </Text>
        </View>
        <Text variant="body" style={{ color: colors.muted, marginBottom: tokens.spacing.md }}>
          Enhance your learning experience with our suite of AI-powered tools
        </Text>
        <View style={styles.grid}>
          {TOOLS.map((t) => (
            <View key={t.key} style={styles.cell}>
              <ToolCard tool={t} />
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  cell: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 280,
  },
});
