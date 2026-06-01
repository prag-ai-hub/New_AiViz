import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import { TOOLS } from "@/core/tools/registry";
import { PricingCard } from "@/features/subscription/components";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function SubscriptionScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleAddToCart = (toolName: string) => {
    showToast.success({
      title: "Coming soon",
      message: `Per-tool checkout for ${toolName} is on the way. Try the Plans page meanwhile.`,
    });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: tokens.spacing.lg,
          paddingBottom: tokens.spacing["2xl"],
        }}
      >
        <View style={styles.headerRow}>
          <View style={styles.title}>
            <Text style={{ fontSize: 22 }}>🪟</Text>
            <Text variant="h1" style={{ color: colors.text }}>
              Our Pricing Plan
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/profile/billing" as never)}
            style={[styles.cart, { borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 18 }}>🛒</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <View key={tool.key} style={styles.cell}>
              <PricingCard
                tool={tool}
                onAddToCart={() => handleAddToCart(tool.name)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  cart: {
    borderWidth: 1,
    borderRadius: tokens.radii.full,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  cell: {
    flexBasis: "31%",
    minWidth: 220,
    flexGrow: 1,
  },
});
