import { Pressable, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { useSkipOnboarding } from "@/features/onboarding/hooks";
import { Button } from "@/shared/components/buttons";
import { Text } from "@/shared/components/typography";

type Props = {
  primaryLabel?: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  /** Per-step skip — moves to next screen without writing the field. */
  onSkipStep?: () => void;
};

export function OnboardingFooter({
  primaryLabel = "Continue",
  onPrimary,
  primaryDisabled,
  primaryLoading,
  onSkipStep,
}: Props) {
  const { colors } = useTheme();
  const { skip, isLoading } = useSkipOnboarding();
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Button label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} loading={primaryLoading} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {onSkipStep ? (
          <Pressable onPress={onSkipStep} hitSlop={8}>
            <Text variant="caption" style={{ color: colors.muted }}>
              Skip this step
            </Text>
          </Pressable>
        ) : <View />}
        <Pressable onPress={skip} hitSlop={8} disabled={isLoading}>
          <Text variant="caption" style={{ color: colors.primary, fontWeight: tokens.fontWeight.semibold }}>
            I'll do this later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
