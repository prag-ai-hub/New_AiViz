import { Redirect } from "expo-router";
import { View } from "react-native";
import { tokens } from "@/core/theme";
import { useAuth, useHydrateAuth, useMe, useShouldOnboard } from "@/features/auth/hooks";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function SplashScreen() {
  useHydrateAuth();
  const { hydrated, isAuthenticated } = useAuth();
  const me = useMe();
  const shouldOnboard = useShouldOnboard();

  // Wait for: token hydration + (if authed) the /me query to settle.
  // Without this gate we'd flash login → home → onboarding.
  const meStillLoading = isAuthenticated && me.isLoading;
  const ready = hydrated && !meStillLoading;

  if (!ready) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: tokens.spacing.lg,
          }}
        >
          <Text variant="h1">AIVIZ</Text>
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (shouldOnboard) return <Redirect href="/(auth)/onboarding/grade" />;
  return <Redirect href="/(tabs)/dashboard" />;
}
