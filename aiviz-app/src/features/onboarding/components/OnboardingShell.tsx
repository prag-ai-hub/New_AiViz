import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { ONBOARDING_STEP_COUNT } from "@/features/onboarding/constants";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

type Props = {
  stepNumber: number; // 1-based
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
};

export function OnboardingShell({ stepNumber, title, subtitle, children, footer }: Props) {
  const { colors } = useTheme();
  const pct = (stepNumber / ONBOARDING_STEP_COUNT) * 100;
  return (
    <Screen>
      <View style={{ height: 6, backgroundColor: colors.surface, borderRadius: 3, marginBottom: tokens.spacing.lg }}>
        <View style={{ height: 6, width: `${pct}%`, backgroundColor: colors.primary, borderRadius: 3 }} />
      </View>
      <Text variant="caption" style={{ color: colors.muted, marginBottom: tokens.spacing.xs }}>
        Step {stepNumber} of {ONBOARDING_STEP_COUNT}
      </Text>
      <Text variant="h1" style={{ marginBottom: subtitle ? tokens.spacing.xs : tokens.spacing.lg }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" style={{ color: colors.muted, marginBottom: tokens.spacing.lg }}>
          {subtitle}
        </Text>
      ) : null}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: tokens.spacing.md, paddingBottom: tokens.spacing["2xl"] }}
        style={{ flex: 1 }}
      >
        {children}
      </ScrollView>
      <View style={{ paddingTop: tokens.spacing.md }}>{footer}</View>
    </Screen>
  );
}
