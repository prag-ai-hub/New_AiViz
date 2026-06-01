import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import { AssistantCard } from "@/shared/components/cards";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

type SliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
};

function Slider({ label, value, onChange, leftLabel, rightLabel }: SliderProps) {
  const { colors } = useTheme();
  return (
    <View style={[sliderStyles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={sliderStyles.head}>
        <Text style={{ color: colors.text, fontWeight: "600" }}>📊 {label}</Text>
        <Text style={{ color: colors.primary, fontWeight: "700" }}>{value}%</Text>
      </View>
      <View style={[sliderStyles.track, { backgroundColor: colors.border }]}>
        <View style={[sliderStyles.fill, { backgroundColor: colors.primary, width: `${value}%` }]} />
        <Pressable
          onPress={() => onChange(value >= 100 ? 0 : Math.min(100, value + 10))}
          style={[sliderStyles.thumb, { backgroundColor: colors.primary, left: `${value}%` }]}
        />
      </View>
      <View style={sliderStyles.legend}>
        <Text variant="caption" style={{ color: colors.muted }}>
          {leftLabel}
        </Text>
        <Text variant="caption" style={{ color: colors.muted }}>
          {rightLabel}
        </Text>
      </View>
    </View>
  );
}

export function MusicGenScreen() {
  const { colors } = useTheme();
  const [desc, setDesc] = useState("");
  const [bass, setBass] = useState(50);
  const [treble, setTreble] = useState(50);
  const [balance, setBalance] = useState(50);

  const reset = () => {
    setBass(50);
    setTreble(50);
    setBalance(50);
  };

  const generate = () => {
    showToast.success({
      title: "Coming soon",
      message: "Music generation is launching in a later day.",
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: tokens.spacing["2xl"] }}>
        <AssistantCard pageIcon="🎵" pageTitle="AI Music Generator">
          <Text variant="caption" style={{ color: colors.muted }}>
            Music Description
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            placeholder="Describe the music you want to create in detail. Example: 'A peaceful piano melody with soft strings in the background, creating a calm and relaxing atmosphere'"
            placeholderTextColor={colors.muted}
            style={[
              styles.textarea,
              { color: colors.text, borderColor: colors.primary, backgroundColor: colors.bg },
            ]}
          />

          <View>
            <Text variant="caption" style={{ color: colors.muted, marginBottom: 4 }}>
              Tips for better results:
            </Text>
            <View style={{ gap: 4 }}>
              <Tip>Include specific instruments (piano, guitar, drums, etc.)</Tip>
              <Tip>Describe the mood (peaceful, energetic, melancholic)</Tip>
              <Tip>Mention tempo (fast, slow, moderate)</Tip>
              <Tip>Add style references (classical, jazz, rock, electronic)</Tip>
            </View>
          </View>

          <Pressable
            onPress={() => setDesc("")}
            style={({ pressed }) => [
              styles.clear,
              {
                borderColor: colors.danger,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ color: colors.danger, fontWeight: "600" }}>❌ Clear Description</Text>
          </Pressable>

          <View style={styles.sliderRow}>
            <Slider label="Bass" value={bass} onChange={setBass} leftLabel="🔉 Low" rightLabel="High 🔊" />
            <Slider label="Treble" value={treble} onChange={setTreble} leftLabel="🎚️ Soft" rightLabel="Bright 📈" />
            <Slider label="Balance" value={balance} onChange={setBalance} leftLabel="◀ Left" rightLabel="Right ▶" />
          </View>

          <Pressable
            onPress={reset}
            style={({ pressed }) => [
              styles.reset,
              { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ color: colors.text }}>🔄 Reset Audio Controls</Text>
          </Pressable>

          <Pressable
            onPress={generate}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 16 }}>🎵</Text>
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>Generate Music</Text>
          </Pressable>
        </AssistantCard>
      </ScrollView>
    </Screen>
  );
}

function Tip({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text variant="caption" style={{ color: colors.muted }}>
      • {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 2,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    minHeight: 100,
    fontSize: tokens.fontSize.md,
    outlineStyle: "none" as any,
  },
  clear: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    alignSelf: "flex-end",
  },
  sliderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  reset: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    alignSelf: "flex-start",
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

const sliderStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 200,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    transform: [{ translateX: -10 }],
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
