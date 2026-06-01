import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { MarkdownRenderer } from "@/features/vidya-lm/components";
import { Text } from "@/shared/components/typography";

type Props = {
  output: string;
  streaming?: boolean;
};

export function OutputPanel({ output, streaming }: Props) {
  const { colors } = useTheme();

  if (!output && !streaming) {
    return (
      <View
        style={[
          styles.empty,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <Text variant="caption" style={{ color: colors.muted }}>
          Pick an action above to get help on your code.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.panel,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <ScrollView contentContainerStyle={{ padding: tokens.spacing.md }}>
        <MarkdownRenderer content={output} color={colors.text} />
        {streaming ? (
          <Text style={{ color: colors.muted, marginTop: 2 }}>▍</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minHeight: 160,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    overflow: "hidden",
  },
  empty: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
