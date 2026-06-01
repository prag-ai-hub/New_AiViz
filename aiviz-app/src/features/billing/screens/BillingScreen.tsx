import { ScrollView, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { TOOLS } from "@/core/tools/registry";
import { PlanCard, QuotaBadge } from "@/features/billing/components";
import { usePlans, useQuotas, useStartCheckout, useSubscription } from "@/features/billing/hooks";
import type { PlanCode } from "@/features/billing/types";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function BillingScreen() {
  const { colors } = useTheme();
  const plans = usePlans();
  const sub = useSubscription();
  const quotas = useQuotas();
  const checkout = useStartCheckout();

  const onUpgrade = (code: PlanCode) => checkout.mutate(code);

  if (plans.isLoading || sub.isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: tokens.spacing.xl, paddingBottom: tokens.spacing["3xl"] }}>
        <Text variant="h2">Plans & Billing</Text>

        {/* Current usage */}
        <View style={{ gap: tokens.spacing.md }}>
          <Text variant="h3">Today's usage</Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: tokens.radii.md,
              padding: tokens.spacing.md,
              gap: tokens.spacing.sm,
            }}
          >
            {TOOLS.map((t) => (
              <View
                key={t.key}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>
                  {t.icon} {t.name}
                </Text>
                <QuotaBadge limit={quotas.limitFor(t.key)} />
              </View>
            ))}
          </View>
        </View>

        {/* Plan picker */}
        <View style={{ gap: tokens.spacing.md }}>
          <Text variant="h3">Choose a plan</Text>
          {(plans.data ?? []).map((p) => (
            <PlanCard
              key={p.code}
              plan={p}
              current={sub.data ?? null}
              onUpgrade={onUpgrade}
              busy={checkout.isPending && checkout.variables === p.code}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
