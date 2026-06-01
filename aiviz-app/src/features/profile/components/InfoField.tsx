import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  label: string;
  value: string | number | null | undefined;
};

export function InfoField({ label, value }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: tokens.spacing.xs, flex: 1 }}>
      <Text variant="caption" style={{ color: colors.muted }}>
        {label}
      </Text>
      <View
        style={[
          styles.pill,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <Text style={{ color: colors.text }}>
          {value != null && value !== "" ? String(value) : "Not Assigned"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
});
