import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { Plan, Subscription } from "@/features/billing/types";
import { Button } from "@/shared/components/buttons";
import { Text } from "@/shared/components/typography";
import { FeatureRow } from "./FeatureRow";

type Props = {
  plan: Plan;
  current: Subscription | null;
  onUpgrade: (planCode: Plan["code"]) => void;
  busy?: boolean;
};

function priceLabel(plan: Plan): string {
  if (plan.code === "institution") return "Contact sales";
  if (plan.price_inr === null) return "Contact sales";
  if (plan.price_inr === 0) return "Free";
  const rupees = (plan.price_inr / 100).toFixed(0);
  return plan.billing_period === "monthly" ? `₹${rupees}/month` : `₹${rupees}`;
}

function featureBullets(plan: Plan): string[] {
  const f = plan.features;
  const out: string[] = [];
  if (f.combined_daily_limit) out.push(`${f.combined_daily_limit} generations/day combined`);
  if (f.combined_daily_limit === null && Object.keys(f.per_tool_daily_limits || {}).length === 0)
    out.push("Unlimited generations");
  if (f.per_tool_daily_limits?.image_gen) out.push(`${f.per_tool_daily_limits.image_gen} images/day`);
  if (f.per_tool_daily_limits?.video_gen) out.push(`${f.per_tool_daily_limits.video_gen} videos/day`);
  if (f.per_tool_daily_limits?.music_gen) out.push(`${f.per_tool_daily_limits.music_gen} music tracks/day`);
  if (f.watermark) out.push("Watermark on media");
  else out.push("No watermark");
  if (f.parent_dashboard) out.push("Parent dashboard");
  if (f.family_seats) out.push(`${f.family_seats} child accounts`);
  return out;
}

export function PlanCard({ plan, current, onUpgrade, busy }: Props) {
  const { colors } = useTheme();
  const isCurrent = current?.plan_code === plan.code;
  const purchasable = plan.code !== "free" && plan.code !== "institution";

  return (
    <View
      style={{
        borderWidth: isCurrent ? 2 : 1,
        borderColor: isCurrent ? colors.primary : colors.border,
        borderRadius: tokens.radii.lg,
        padding: tokens.spacing.lg,
        backgroundColor: colors.surface,
        gap: tokens.spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text variant="h3">{plan.name}</Text>
        <Text variant="body" style={{ color: colors.muted }}>
          {priceLabel(plan)}
        </Text>
      </View>
      <View style={{ gap: tokens.spacing.xs }}>
        {featureBullets(plan).map((b) => (
          <FeatureRow key={b} label={b} />
        ))}
      </View>
      {isCurrent ? (
        <Button variant="ghost" label="Current plan" disabled onPress={() => {}} />
      ) : purchasable ? (
        <Button label={`Upgrade to ${plan.name}`} loading={busy} onPress={() => onUpgrade(plan.code)} />
      ) : (
        <Button variant="secondary" label="Contact sales" disabled onPress={() => {}} />
      )}
    </View>
  );
}
