import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/core/providers";
import { useCreateSession } from "@/features/vidya-lm/hooks";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function ChatLandingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ firstMessage?: string }>();
  const create = useCreateSession();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    create
      .mutateAsync(undefined)
      .then((session) => {
        const firstMessage =
          typeof params.firstMessage === "string" ? params.firstMessage : "";
        if (firstMessage) {
          router.replace({
            pathname: `/tools/vidya-lm/${session.id}` as never,
            params: { firstMessage } as never,
          });
        } else {
          router.replace(`/tools/vidya-lm/${session.id}` as never);
        }
      })
      .catch(() => {
        // useCreateSession already toasts the error; allow a retry on remount.
        startedRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Spinner size="large" />
        <Text variant="caption" style={{ color: colors.muted, marginTop: 12 }}>
          Starting a new chat…
        </Text>
      </View>
    </Screen>
  );
}
