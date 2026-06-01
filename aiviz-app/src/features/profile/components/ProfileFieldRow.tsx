import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  label: string;
  value: string | null;
};

export function ProfileFieldRow({ label, value }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: tokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text variant="caption" style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text style={{ color: value ? colors.text : colors.muted }}>{value ?? "—"}</Text>
    </View>
  );
}
