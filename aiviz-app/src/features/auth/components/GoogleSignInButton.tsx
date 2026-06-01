import { Platform } from "react-native";
import { Button } from "@/shared/components/buttons";
import { useGoogleSignIn } from "@/features/auth/hooks";

function platformClientId(): string | undefined {
  const web = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
  if (Platform.OS === "ios") return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || web;
  if (Platform.OS === "android") return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || web;
  return web;
}

export function GoogleSignInButton() {
  // Hide button when no Google client ID is configured anywhere.
  // Rules-of-Hooks safe because env vars are baked at build time → condition is stable.
  if (!platformClientId()) return null;
  return <ConfiguredGoogleSignInButton />;
}

function ConfiguredGoogleSignInButton() {
  const { isReady, isLoading, promptAsync } = useGoogleSignIn();
  return (
    <Button
      variant="secondary"
      label="Continue with Google"
      loading={isLoading}
      disabled={!isReady}
      onPress={() => promptAsync()}
    />
  );
}
