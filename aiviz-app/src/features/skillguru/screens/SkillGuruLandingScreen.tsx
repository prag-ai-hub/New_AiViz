import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import { AssistantCard } from "@/shared/components/cards";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function SkillGuruLandingScreen() {
  const { colors } = useTheme();

  const handleAnalyze = () => {
    showToast.success({
      title: "Coming soon",
      message: "Gap Analyzer Pro is launching in a later day.",
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: tokens.spacing["2xl"] }}>
        <AssistantCard
          pageIcon="📊"
          pageTitle="Gap Analyzer Pro"
          headerIcon="📈"
          headerTitle="AI Learning Analyzer"
          headerSubtitle="Analyze learning gaps from answer sheets, get personalized recommendations, and track progress."
        >
          <Pressable
            onPress={handleAnalyze}
            style={[styles.dropZone, { borderColor: colors.primary, backgroundColor: colors.bg }]}
          >
            <Text style={{ fontSize: 36, marginBottom: tokens.spacing.sm }}>📄</Text>
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              Upload answer sheets
            </Text>
            <Text variant="caption" style={{ color: colors.muted, textAlign: "center" }}>
              PDF, image (JPG/PNG), or scanned worksheet
            </Text>
          </Pressable>

          <View style={{ gap: tokens.spacing.xs }}>
            <Text variant="caption" style={{ color: colors.muted }}>
              What you'll get:
            </Text>
            <Bullet>Concept-level mastery breakdown</Bullet>
            <Bullet>Personalised practice recommendations</Bullet>
            <Bullet>Progress timeline across attempts</Bullet>
          </View>

          <Pressable
            onPress={handleAnalyze}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>Analyze Gaps</Text>
          </Pressable>
        </AssistantCard>
      </ScrollView>
    </Screen>
  );
}

function Bullet({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text variant="caption" style={{ color: colors.muted }}>
      • {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing["2xl"],
    paddingHorizontal: tokens.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.xs,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
});
