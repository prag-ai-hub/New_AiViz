import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { useStylePresets } from "@/features/image-gen/hooks";
import type { StylePreset } from "@/features/image-gen/types";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";

type Props = {
  value: StylePreset | "";
  onChange: (next: StylePreset | "") => void;
  disabled?: boolean;
};

export function StyleChips({ value, onChange, disabled }: Props) {
  const { colors } = useTheme();
  const { data, isLoading } = useStylePresets();

  if (isLoading) {
    return (
      <View style={{ paddingVertical: tokens.spacing.sm }}>
        <Spinner size="small" />
      </View>
    );
  }

  const items = [
    { value: "" as const, label: "No style" },
    ...(data?.items ?? []),
  ];

  return (
    <View style={{ gap: tokens.spacing.xs }}>
      <Text variant="caption" style={{ color: colors.muted }}>
        Style
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <Pressable
              key={item.value || "none"}
              onPress={() => onChange(item.value)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? colors.primaryFg : colors.text,
                  fontWeight: "600",
                  fontSize: tokens.fontSize.sm,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: tokens.spacing.sm },
  chip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
});
