import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import { AssistantCard } from "@/shared/components/cards";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function AvatarScreen() {
  const { colors } = useTheme();

  const handleStart = () => {
    showToast.success({
      title: "Coming soon",
      message: "Vidya Avatar is launching in a later day.",
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: tokens.spacing["2xl"] }}>
        <AssistantCard
          pageIcon="🧑‍🏫"
          pageTitle="Vidya Avatar"
          headerIcon="🎭"
          headerTitle="AI Avatar Assistant"
          headerSubtitle="AI-powered voice assistant with a lifelike avatar for interactive conversations."
        >
          <View
            style={[
              styles.stage,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 56, marginBottom: tokens.spacing.md }}>🧑‍🏫</Text>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: tokens.fontSize.lg }}>
              Meet Vidya
            </Text>
            <Text variant="caption" style={{ color: colors.muted, textAlign: "center" }}>
              Tap below to begin a face-to-face study session.
            </Text>
          </View>

          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 16 }}>▶️</Text>
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
              Start Conversation
            </Text>
          </Pressable>
        </AssistantCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing["2xl"],
    paddingHorizontal: tokens.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
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
