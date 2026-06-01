import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  icon: string;
  name: string;
  active?: boolean;
  expiresAt?: string | null;
  used?: number;
  limit?: number | null;
};

export function SubscriptionRow({ icon, name, active = true, expiresAt, used, limit }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.head}>
        <Text style={{ fontSize: 18 }}>📦</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "600" }}>{name}</Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: active ? "rgba(74,222,128,0.18)" : "rgba(248,113,113,0.18)",
                  borderColor: active ? colors.success : colors.danger,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.success : colors.danger,
                  fontSize: tokens.fontSize.xs,
                  fontWeight: "700",
                }}
              >
                {active ? "Active" : "Inactive"}
              </Text>
            </View>
            {expiresAt ? (
              <Text variant="caption" style={{ color: colors.muted }}>
                Expires: {expiresAt}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <Text variant="caption" style={{ color: colors.muted, marginTop: tokens.spacing.xs }}>
        Usage: {used ?? 0}/{limit ?? "∞"} messages
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radii.sm,
  },
});
