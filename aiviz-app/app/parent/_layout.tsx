import { Stack } from "expo-router";
import { ParentGuard } from "@/core/guards";

export default function ParentLayout() {
  return (
    <ParentGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </ParentGuard>
  );
}
