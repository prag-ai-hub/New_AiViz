import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { SourceKind } from "@/features/library/types";
import { Text } from "@/shared/components/typography";

export type FilterValue = "all" | SourceKind;

type Props = {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  counts?: Partial<Record<FilterValue, number>>;
};

const ITEMS: { value: FilterValue; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "✨" },
  { value: "vidya_lm", label: "Chats", icon: "💬" },
  { value: "image_gen", label: "Images", icon: "🖼️" },
  { value: "video_gen", label: "Videos", icon: "🎬" },
  { value: "code_helper", label: "Code", icon: "💻" },
];

export function FilterChips({ value, onChange, counts }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ITEMS.map((item) => {
        const active = item.value === value;
        const count = counts?.[item.value];
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ fontSize: 14 }}>{item.icon}</Text>
            <Text
              style={{
                color: active ? colors.primaryFg : colors.text,
                fontWeight: "600",
                fontSize: tokens.fontSize.sm,
              }}
            >
              {item.label}
              {count != null ? ` · ${count}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
});
