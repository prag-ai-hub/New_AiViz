import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

type Invoice = {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: "paid" | "pending" | "failed";
};

// Placeholder: real invoice history endpoint ships later.
const INVOICES: Invoice[] = [];

export function PaymentHistoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const totalSpent = INVOICES
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const totalInvoices = INVOICES.length;
  const paidInvoices = INVOICES.filter((i) => i.status === "paid").length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing["2xl"] }}>
        <View style={styles.headerRow}>
          <View style={styles.title}>
            <Text style={{ fontSize: 22 }}>📄</Text>
            <Text variant="h1" style={{ color: colors.text }}>
              Payment History
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/subscription" as never)}
            style={({ pressed }) => [
              styles.viewPlans,
              { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 14 }}>🛒</Text>
            <Text style={{ color: colors.text, fontWeight: "600" }}>View Plans</Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBlock
            label="Total Spent"
            value={`₹${totalSpent.toFixed(2)}`}
            background="#7B5BD6"
          />
          <StatBlock
            label="Total Invoices"
            value={String(totalInvoices)}
            background="#E84F8C"
          />
          <StatBlock
            label="Paid Invoices"
            value={String(paidInvoices)}
            background="#1FBED6"
          />
        </View>

        {/* Invoices panel */}
        <View
          style={[
            styles.panel,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <View style={[styles.panelHead, { borderBottomColor: colors.border }]}>
            <Text variant="body" style={{ color: colors.text, fontWeight: "600" }}>
              All Invoices
            </Text>
          </View>

          {INVOICES.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 56, marginBottom: tokens.spacing.md }}>📥</Text>
              <Text variant="body" style={{ color: colors.muted, marginBottom: tokens.spacing.lg }}>
                No invoices found
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/subscription" as never)}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
                  Browse Subscription Plans
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: tokens.spacing.sm, padding: tokens.spacing.md }}>
              {INVOICES.map((inv) => (
                <View
                  key={inv.id}
                  style={[styles.invoiceRow, { borderBottomColor: colors.border }]}
                >
                  <Text style={{ color: colors.text }}>{inv.date}</Text>
                  <Text style={{ color: colors.text }}>{inv.plan}</Text>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    ₹{inv.amount.toFixed(2)}
                  </Text>
                  <Text
                    style={{
                      color: inv.status === "paid" ? colors.success : colors.muted,
                      fontWeight: "600",
                    }}
                  >
                    {inv.status.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatBlock({
  label,
  value,
  background,
}: {
  label: string;
  value: string;
  background: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: background }]}>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: tokens.fontSize.md, fontWeight: "600" }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: tokens.fontSize["3xl"],
          fontWeight: "800",
          marginTop: tokens.spacing.sm,
        }}
      >
        {value}
      </Text>
    </View>
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
  viewPlans: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: tokens.spacing.md,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    minHeight: 110,
    justifyContent: "center",
  },
  panel: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  panelHead: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: tokens.spacing["3xl"],
  },
  cta: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
