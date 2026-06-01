import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import { LANGUAGES } from "@/features/onboarding/constants";
import { AssistantCard } from "@/shared/components/cards";
import { ActionSheet, type ActionSheetItem } from "@/shared/components/modals";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

type Tab = "chat" | "vocab" | "pron";

export function SpeechTutorLandingScreen() {
  const { colors } = useTheme();
  const [yourLang, setYourLang] = useState("en");
  const [learnLang, setLearnLang] = useState("en");
  const [tab, setTab] = useState<Tab>("chat");
  const [openSheet, setOpenSheet] = useState<"yours" | "learn" | null>(null);

  const label = (v: string) =>
    LANGUAGES.find((l) => l.value === v)?.label ?? v;

  const sheetItems: ActionSheetItem[] = LANGUAGES.map((l) => ({
    label: l.label,
    onPress: () => {
      if (openSheet === "yours") setYourLang(l.value);
      if (openSheet === "learn") setLearnLang(l.value);
    },
  }));

  const handleStart = () => {
    showToast.success({
      title: "Coming soon",
      message: "Voice conversations with Vidya are launching in a later day.",
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: tokens.spacing["2xl"] }}>
        <AssistantCard
          pageIcon="🎤"
          pageTitle="Speech Language Tutor"
          headerIcon="🎧"
          headerTitle="AI Language Assistant"
          headerSubtitle="Practice speaking and learn new languages with AI-powered voice interaction"
        >
          <View style={styles.langRow}>
            <View style={{ flex: 1, gap: tokens.spacing.xs }}>
              <Text variant="caption" style={{ color: colors.muted }}>
                Your Language
              </Text>
              <Pressable
                onPress={() => setOpenSheet("yours")}
                style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.bg }]}
              >
                <Text style={{ color: colors.text, flex: 1 }}>{label(yourLang)}</Text>
                <Text style={{ color: colors.muted }}>▾</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1, gap: tokens.spacing.xs }}>
              <Text variant="caption" style={{ color: colors.muted }}>
                Learning Language
              </Text>
              <Pressable
                onPress={() => setOpenSheet("learn")}
                style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.bg }]}
              >
                <Text style={{ color: colors.text, flex: 1 }}>{label(learnLang)}</Text>
                <Text style={{ color: colors.muted }}>▾</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
            <TabButton label="💬 Chat" active={tab === "chat"} onPress={() => setTab("chat")} />
            <TabButton label="📖 Vocabulary" active={tab === "vocab"} onPress={() => setTab("vocab")} />
            <TabButton label="🔊 Pronunciation" active={tab === "pron"} onPress={() => setTab("pron")} />
          </View>

          <View
            style={[
              styles.hint,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.primary }}>🎤 Click "Start Conversation" to begin</Text>
          </View>

          <View
            style={[
              styles.transcript,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.muted, fontStyle: "italic" }}>
              Your conversation will appear here...
            </Text>
          </View>

          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 14 }}>▶️</Text>
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
              Start Conversation
            </Text>
          </Pressable>
        </AssistantCard>
      </ScrollView>

      <ActionSheet
        visible={openSheet != null}
        onClose={() => setOpenSheet(null)}
        title={openSheet === "yours" ? "Your Language" : "Learning Language"}
        items={sheetItems}
      />
    </Screen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
      ]}
    >
      <Text
        style={{
          color: active ? colors.primary : colors.muted,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: "row",
    gap: tokens.spacing.md,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: "center",
  },
  hint: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    alignItems: "center",
  },
  transcript: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.lg,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.full,
  },
});
