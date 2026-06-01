import { ReactNode } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { AivizLogo } from "@/shared/components/branding";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const WIDE_BREAKPOINT = 880;
const PANEL_WIDTH_PCT = 32; // % of viewport on wide screens

export function AuthCard({ title, subtitle, children, footer }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  return (
    <Screen padded={false} fullWidth>
      {wide ? (
        <View style={[styles.stage, { backgroundColor: "#0B2640" }]}>
          {/* Full-bleed promo background */}
          <View style={styles.promoFill}>
            <View style={styles.promoBody}>
              <Text style={styles.promoLabel}>LAUNCH OFFER</Text>
              <Text style={styles.promoBig}>50% OFF</Text>
              <Text style={styles.promoSub}>Valid For Limited Time</Text>
            </View>
            <View style={styles.promoFooter}>
              <AivizLogo size={64} />
            </View>
          </View>

          {/* Floating form panel on the right */}
          <View
            style={[
              styles.panelFloat,
              {
                width: `${PANEL_WIDTH_PCT}%`,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.panelContent}
              keyboardShouldPersistTaps="handled"
            >
              <FormBody
                title={title}
                subtitle={subtitle}
                children={children}
                footer={footer}
              />
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            padding: tokens.spacing.lg,
            justifyContent: "center",
          }}
        >
          <View
            style={[
              styles.panelCompact,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <FormBody
              title={title}
              subtitle={subtitle}
              children={children}
              footer={footer}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

function FormBody({ title, subtitle, children, footer }: Props) {
  const { colors } = useTheme();
  return (
    <>
      <View style={styles.logoRow}>
        <AivizLogo size={56} />
      </View>
      <View style={{ alignItems: "center", marginBottom: tokens.spacing.lg }}>
        <Text variant="h1" style={{ color: colors.text, textAlign: "center" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="caption"
            style={{ color: colors.muted, textAlign: "center", marginTop: 4 }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ gap: tokens.spacing.md, width: "100%" }}>
        {children}
        {footer ? (
          <View style={{ alignItems: "center", marginTop: tokens.spacing.md }}>
            {footer}
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  promoFill: {
    ...StyleSheet.absoluteFillObject,
    padding: tokens.spacing["3xl"],
    justifyContent: "space-between",
  },
  promoBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.lg,
    // leave room so the floating form doesn't sit on top of the text
    paddingRight: `${PANEL_WIDTH_PCT}%`,
  },
  promoLabel: {
    color: "#E5F2FF",
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: 4,
    fontFamily: "serif",
    textAlign: "center",
  },
  promoBig: {
    color: "#1FBED6",
    fontSize: 112,
    fontWeight: "900",
    fontFamily: "serif",
    textAlign: "center",
  },
  promoSub: {
    color: "#E5F2FF",
    fontSize: 40,
    fontFamily: "serif",
    textAlign: "center",
  },
  promoFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: `${PANEL_WIDTH_PCT}%`,
  },
  panelFloat: {
    position: "absolute",
    top: 24,
    right: 24,
    bottom: 24,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  panelContent: {
    flexGrow: 1,
    padding: tokens.spacing["2xl"],
    justifyContent: "center",
  },
  panelCompact: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing["2xl"],
  },
  logoRow: {
    alignItems: "center",
    marginBottom: tokens.spacing.md,
  },
});
