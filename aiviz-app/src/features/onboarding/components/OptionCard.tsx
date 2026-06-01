import { Pressable, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionCard({ title, subtitle, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}>
      {({ pressed }) => (
        <View
          style={{
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.surface : "transparent",
            borderRadius: tokens.radii.lg,
            padding: tokens.spacing.lg,
            opacity: pressed ? 0.85 : 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, gap: subtitle ? tokens.spacing.xs : 0 }}>
            <Text style={{ fontWeight: selected ? tokens.fontWeight.semibold : tokens.fontWeight.regular }}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="caption" style={{ color: colors.muted }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {selected ? (
            <Text style={{ color: colors.primary, fontWeight: tokens.fontWeight.bold }}>✓</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
