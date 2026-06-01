import { useQueryClient } from "@tanstack/react-query";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { googleSignIn, routeAfterAuth } from "@/features/auth/services";

WebBrowser.maybeCompleteAuthSession();

const ERROR_LABEL: Record<string, string> = {
  google_token_invalid: "Google sign-in could not be verified.",
  google_email_unverified: "Your Google email isn't verified.",
};

export function useGoogleSignIn() {
  const router = useRouter();
  const qc = useQueryClient();
  const [exchanging, setExchanging] = useState(false);

  const web = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: web,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || web,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || web,
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.authentication?.idToken ?? response.params?.id_token;
    if (!idToken) {
      showToast.error({ title: "Google sign-in failed", message: "No ID token returned." });
      return;
    }
    setExchanging(true);
    googleSignIn(idToken)
      .then(async (res) => {
        showToast.success({
          title: res.created ? "Welcome to AIVIZ" : `Welcome back, ${res.user.first_name || res.user.email}`,
        });
        await qc.invalidateQueries({ queryKey: ["me"] });
        // Newly-created Google users have no profile yet → force onboarding.
        const dest = await routeAfterAuth({ forceOnboarding: !!res.created });
        router.replace(dest);
      })
      .catch((err) => {
        const code = err instanceof ApiError ? err.code : "network_error";
        showToast.error({
          title: "Google sign-in failed",
          message: ERROR_LABEL[code] ?? "Please try again.",
        });
      })
      .finally(() => setExchanging(false));
  }, [response, router, qc]);

  return {
    isReady: !!request,
    isLoading: exchanging,
    promptAsync: () => promptAsync(),
  };
}
