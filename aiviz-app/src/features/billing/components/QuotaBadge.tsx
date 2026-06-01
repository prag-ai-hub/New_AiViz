import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { QuotaLimit } from "@/features/billing/types";
import { Text } from "@/shared/components/typography";

type Props = {
  limit: QuotaLimit;
};

export function QuotaBadge({ limit }: Props) {
  const { colors } = useTheme();

  if (limit.limit === null) {
    return (
      <Pill bg={colors.surface} fg={colors.muted} border={colors.border} label="Unlimited" />
    );
  }

  const exhausted = (limit.remaining ?? 0) <= 0;
  return (
    <Pill
      bg={exhausted ? colors.danger : colors.surface}
      fg={exhausted ? colors.primaryFg : colors.text}
      border={exhausted ? colors.danger : colors.border}
      label={`${limit.remaining ?? 0} / ${limit.limit} left today`}
    />
  );
}

function Pill({ bg, fg, border, label }: { bg: string; fg: string; border: string; label: string }) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        paddingHorizontal: tokens.spacing.sm,
        paddingVertical: 2,
        borderRadius: tokens.radii.full,
        alignSelf: "flex-start",
      }}
    >
      <Text variant="caption" style={{ color: fg, fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}
