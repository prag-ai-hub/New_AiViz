import { ScrollView, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { usePlans, useStartCheckout, useSubscription } from "@/features/billing/hooks";
import type { PlanCode } from "@/features/billing/types";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";
import { PlanCard } from "./PlanCard";

export function PaywallSheet() {
  const { colors } = useTheme();
  const plans = usePlans();
  const sub = useSubscription();
  const checkout = useStartCheckout();

  const loading = plans.isLoading || sub.isLoading;

  const onUpgrade = (code: PlanCode) => checkout.mutate(code);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing["3xl"] }}>
        <View style={{ gap: tokens.spacing.xs }}>
          <Text variant="h1">Upgrade your plan</Text>
          <Text variant="body" style={{ color: colors.muted }}>
            Unlock unlimited tutoring + higher media gen limits.
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: tokens.spacing["2xl"], alignItems: "center" }}>
            <Spinner size="large" />
          </View>
        ) : (
          (plans.data ?? []).map((p) => (
            <PlanCard
              key={p.code}
              plan={p}
              current={sub.data ?? null}
              onUpgrade={onUpgrade}
              busy={checkout.isPending && checkout.variables === p.code}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

export default PaywallSheet;
