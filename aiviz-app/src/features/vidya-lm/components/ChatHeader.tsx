import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  title?: string;
  onNew: () => void;
  onClear: () => void;
  creating?: boolean;
  clearing?: boolean;
};

export function ChatHeader({
  title = "AI Chat Assistant",
  onNew,
  onClear,
  creating,
  clearing,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.icon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16 }}>💬</Text>
        </View>
        <Text variant="body" style={{ color: colors.text, fontWeight: "600" }}>
          {title}
        </Text>
      </View>

      <View style={styles.right}>
        <HeaderButton
          label={creating ? "…" : "New"}
          onPress={onNew}
          disabled={creating}
          color={colors.primary}
          borderColor={colors.primary}
        />
        <HeaderButton
          label={clearing ? "…" : "Clear"}
          onPress={onClear}
          disabled={clearing}
          color={colors.danger}
          borderColor={colors.danger}
        />
      </View>
    </View>
  );
}

function HeaderButton({
  label,
  onPress,
  disabled,
  color,
  borderColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  borderColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={{ color, fontWeight: "600", fontSize: tokens.fontSize.sm }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: tokens.spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
  },
  btn: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
});
