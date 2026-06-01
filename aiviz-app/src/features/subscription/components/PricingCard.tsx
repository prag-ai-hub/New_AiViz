import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { ToolMeta } from "@/core/tools/registry";
import { Text } from "@/shared/components/typography";

type Props = {
  tool: ToolMeta;
  onAddToCart: () => void;
};

const INCLUDED = [
  "40 messages/day",
  "Chat support",
  "Collections",
  "Premium Support",
];

export function PricingCard({ tool, onAddToCart }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: tool.is_popular ? colors.primary : colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      {tool.is_popular ? (
        <View style={styles.popularBadge}>
          <Text style={{ color: "#0B0B0F", fontWeight: "700", fontSize: 12 }}>
            Most Popular
          </Text>
        </View>
      ) : null}

      <View style={styles.iconCircle}>
        <Text style={{ fontSize: 24 }}>{tool.icon}</Text>
      </View>

      <Text variant="h3" style={{ color: colors.text, textAlign: "center" }}>
        {tool.name}
      </Text>

      <Text style={[styles.price, { color: "#F2A23A" }]}>
        {tool.price_inr_monthly.toFixed(1)}
        <Text style={{ fontSize: 18, color: "#F2A23A" }}>₹</Text>
      </Text>
      <Text variant="caption" style={{ color: colors.muted, textAlign: "center" }}>
        per month
      </Text>

      <Text
        variant="caption"
        style={{
          color: colors.muted,
          textAlign: "center",
          marginTop: tokens.spacing.sm,
          paddingHorizontal: tokens.spacing.md,
        }}
      >
        Built for organizations looking for more security and customization.
      </Text>

      <Pressable
        onPress={onAddToCart}
        style={({ pressed }) => [
          styles.cta,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ color: "#0B0B0F", fontWeight: "700" }}>Add to Cart</Text>
      </Pressable>

      <Text
        variant="caption"
        style={{
          color: colors.muted,
          textAlign: "center",
          marginTop: tokens.spacing.md,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Includes
      </Text>

      <View style={{ gap: tokens.spacing.xs }}>
        {INCLUDED.map((line) => (
          <View key={line} style={styles.bullet}>
            <Text style={{ color: colors.primary, fontWeight: "700" }}>✓</Text>
            <Text style={{ color: colors.text }}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 200,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    alignItems: "center",
    gap: tokens.spacing.sm,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F2A23A",
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(31,190,214,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  price: {
    fontSize: 36,
    fontWeight: "700",
    marginTop: tokens.spacing.sm,
  },
  cta: {
    width: "100%",
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.full,
    alignItems: "center",
    marginTop: tokens.spacing.md,
    // gold gradient via solid color (no LinearGradient dep)
    backgroundColor: "#E0A14C",
  },
  bullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
});
