import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { setSetting } from "@/core/storage";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { useShouldOnboard } from "@/features/auth/hooks";
import { Text } from "@/shared/components/typography";

export function CompleteProfileCTA() {
  const { colors } = useTheme();
  const router = useRouter();
  const shouldOnboard = useShouldOnboard();

  if (!shouldOnboard) return null;

  const start = async () => {
    await setSetting("onboarding_dismissed", false); // clear so the splash gate works for next launches too
    router.push("/(auth)/onboarding/grade");
  };

  return (
    <Pressable onPress={start}>
      <View
        style={{
          padding: tokens.spacing.md,
          borderRadius: tokens.radii.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.primary,
          gap: tokens.spacing.xs,
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: tokens.fontWeight.semibold }}>
          Complete your profile
        </Text>
        <Text variant="caption" style={{ color: colors.muted }}>
          Tell us about your grade and subjects to personalize every tool.
        </Text>
      </View>
    </Pressable>
  );
}
