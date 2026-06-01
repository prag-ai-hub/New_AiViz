import { Pressable } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SubjectChip({ label, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={{
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: tokens.spacing.sm,
        borderRadius: tokens.radii.full,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : "transparent",
      }}
    >
      <Text style={{ color: selected ? colors.primaryFg : colors.text, fontSize: tokens.fontSize.sm }}>
        {label}
      </Text>
    </Pressable>
  );
}
