import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  pageIcon?: string;
  pageTitle: string;
  headerIcon?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  children: ReactNode;
};

export function AssistantCard({
  pageIcon,
  pageTitle,
  headerIcon,
  headerTitle,
  headerSubtitle,
  children,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={styles.titleRow}>
        {pageIcon ? <Text style={{ fontSize: 22 }}>{pageIcon}</Text> : null}
        <Text variant="h1" style={{ color: colors.text }}>
          {pageTitle}
        </Text>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {headerTitle ? (
          <View
            style={[
              styles.head,
              { borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.headTitle}>
              {headerIcon ? <Text style={{ fontSize: 18 }}>{headerIcon}</Text> : null}
              <Text variant="body" style={{ color: colors.text, fontWeight: "600" }}>
                {headerTitle}
              </Text>
            </View>
            {headerSubtitle ? (
              <Text variant="caption" style={{ color: colors.muted, marginTop: 4 }}>
                {headerSubtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  head: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  body: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
});
