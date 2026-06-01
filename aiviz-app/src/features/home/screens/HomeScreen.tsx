import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { TOOLS } from "@/core/tools/registry";
import { useMe } from "@/features/auth/hooks";
import { useQuotas, useSubscription } from "@/features/billing/hooks";
import { ToolCard } from "@/features/home/components";
import { Button } from "@/shared/components/buttons";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const me = useMe();
  const sub = useSubscription();
  const quotas = useQuotas();

  const firstName = me.data?.user.first_name || me.data?.user.email?.split("@")[0] || "there";
  const planName = sub.data?.plan_name ?? "Free";
  const topTools = TOOLS.slice(0, 4);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing["2xl"] }}>
        <View style={{ gap: tokens.spacing.xs }}>
          <Text variant="h2">Hi, {firstName} 👋</Text>
          <Text variant="caption" style={{ color: colors.muted }}>
            You're on the <Text style={{ color: colors.primary, fontWeight: tokens.fontWeight.semibold }}>{planName}</Text> plan.
          </Text>
        </View>

        <View style={{ gap: tokens.spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text variant="h3">Quick access</Text>
            <Text
              onPress={() => router.push("/(tabs)/tools")}
              variant="caption"
              style={{ color: colors.primary, fontWeight: tokens.fontWeight.semibold }}
            >
              View all →
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.md }}>
            {topTools.map((t) => (
              <View key={t.key} style={{ width: "48%" }}>
                <ToolCard tool={t} limit={quotas.limitFor(t.key)} />
              </View>
            ))}
          </View>
        </View>

        {sub.data?.plan_code === "free" ? (
          <Button label="Upgrade for unlimited" onPress={() => router.push("/modal/paywall")} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
