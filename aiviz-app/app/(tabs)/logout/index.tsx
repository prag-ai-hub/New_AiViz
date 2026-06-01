import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { useSignOut } from "@/features/auth/hooks";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export default function LogoutScreen() {
  const { colors } = useTheme();
  const signOut = useSignOut();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    signOut().catch(() => {
      firedRef.current = false;
    });
  }, [signOut]);

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.spacing.md,
        }}
      >
        <Spinner size="large" />
        <Text variant="body" style={{ color: colors.muted }}>
          Signing out…
        </Text>
      </View>
    </Screen>
  );
}
