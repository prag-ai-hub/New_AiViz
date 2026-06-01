import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  title?: string;
  subtitle?: string;
};

export function CodeHelperHeader({
  title = "AI Code Assistant",
  subtitle = "Get intelligent code suggestions and improvements using advanced AI models.",
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border }]}>
      <View style={styles.titleRow}>
        <Text style={{ color: colors.primary, fontFamily: "monospace", fontWeight: "700" }}>
          {">_"}
        </Text>
        <Text variant="body" style={{ color: colors.text, fontWeight: "600" }}>
          {title}
        </Text>
      </View>
      <Text variant="caption" style={{ color: colors.muted, marginTop: tokens.spacing.xs }}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
});
