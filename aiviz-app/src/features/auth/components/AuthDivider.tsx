import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  label?: string;
};

export function AuthDivider({ label = "or continue with" }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: colors.border, opacity: 0.4 }]} />
      <Text variant="caption" style={{ color: colors.muted }}>
        {label}
      </Text>
      <View style={[styles.line, { backgroundColor: colors.border, opacity: 0.4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
  },
});
