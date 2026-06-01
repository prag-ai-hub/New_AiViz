import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { ActionSheet, type ActionSheetItem } from "@/shared/components/modals";
import { Text } from "@/shared/components/typography";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label?: string;
  value: T | null;
  options: DropdownOption<T>[];
  onChange: (next: T) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled,
}: Props<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  const items: ActionSheetItem[] = options.map((opt) => ({
    label: opt.label,
    onPress: () => onChange(opt.value),
  }));

  return (
    <View style={{ flex: 1, gap: tokens.spacing.xs }}>
      {label ? (
        <Text variant="caption" style={{ color: colors.muted }}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={{ color: selected ? colors.text : colors.muted, flex: 1 }}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={{ color: colors.muted, marginLeft: tokens.spacing.sm }}>▾</Text>
      </Pressable>
      <ActionSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label}
        items={items}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
  },
});
