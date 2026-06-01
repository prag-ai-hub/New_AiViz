import { Stack } from "expo-router";
import { AuthGuard } from "@/core/guards";

export default function ProtectedLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );
}
