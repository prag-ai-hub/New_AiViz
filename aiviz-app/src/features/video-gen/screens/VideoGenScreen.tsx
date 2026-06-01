import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import {
  ActiveJobCard,
  CompletedJobCard,
  VideoPlayerModal,
} from "@/features/video-gen/components";
import {
  useGenerateVideo,
  useVideoJobs,
} from "@/features/video-gen/hooks";
import { isActive, type VideoJob } from "@/features/video-gen/types";
import { AssistantCard } from "@/shared/components/cards";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function VideoGenScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ prompt?: string }>();
  const [prompt, setPrompt] = useState("");
  const [playing, setPlaying] = useState<VideoJob | null>(null);
  const seedAppliedRef = useRef(false);

  useEffect(() => {
    if (seedAppliedRef.current) return;
    const seed = params.prompt;
    if (seed && typeof seed === "string") {
      setPrompt(seed);
      seedAppliedRef.current = true;
    }
  }, [params.prompt]);

  const jobsQuery = useVideoJobs();
  const allJobs: VideoJob[] = useMemo(() => {
    const pages = jobsQuery.data?.pages ?? [];
    return pages.flatMap((p) => p.results);
  }, [jobsQuery.data]);

  const active = allJobs.filter((j) => isActive(j.status));
  const completed = allJobs
    .filter((j) => j.status === "succeeded")
    .slice(0, 10);

  const generate = useGenerateVideo({
    onSuccess: () => setPrompt(""),
  });

  const handleGenerate = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    generate.mutate({ prompt: trimmed });
  };

  const ctaDisabled = !prompt.trim() || generate.isPending;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: tokens.spacing["2xl"],
          gap: tokens.spacing.lg,
        }}
      >
        <AssistantCard
          pageIcon="🎬"
          pageTitle="Text-to-Video Generator"
          headerIcon="🎞️"
          headerTitle="AI Video Assistant"
          headerSubtitle="Create a short 5-second clip from a description. Generation takes about a minute — you can browse other tools while it runs."
        >
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            multiline
            editable={!generate.isPending}
            placeholder="Describe the scene you want to generate as a video…"
            placeholderTextColor={colors.muted}
            style={[
              styles.textarea,
              {
                color: colors.text,
                borderColor: colors.primary,
                backgroundColor: colors.bg,
              },
            ]}
          />

          <Pressable
            onPress={handleGenerate}
            disabled={ctaDisabled}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: !ctaDisabled
                  ? colors.primary
                  : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {generate.isPending ? (
              <Spinner size="small" color={colors.primaryFg} />
            ) : (
              <Text style={{ fontSize: 16 }}>🎬</Text>
            )}
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
              {generate.isPending ? "Queuing…" : "Generate Video"}
            </Text>
          </Pressable>
        </AssistantCard>

        {active.length > 0 ? (
          <View style={styles.section}>
            <Text
              variant="body"
              style={{ color: colors.text, fontWeight: "700" }}
            >
              ⏳ In progress
            </Text>
            {active.map((job) => (
              <ActiveJobCard key={job.id} jobId={job.id} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text
            variant="body"
            style={{ color: colors.text, fontWeight: "700" }}
          >
            ✨ Recent
          </Text>
          {jobsQuery.isLoading ? (
            <View style={{ alignItems: "center", padding: tokens.spacing.xl }}>
              <Spinner size="large" />
            </View>
          ) : completed.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text style={{ fontSize: 36, marginBottom: tokens.spacing.sm }}>
                🎬
              </Text>
              <Text variant="body" style={{ color: colors.muted }}>
                No videos yet — try the prompt box above.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {completed.map((job) => (
                <CompletedJobCard
                  key={job.id}
                  job={job}
                  onPress={() => setPlaying(job)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <VideoPlayerModal job={playing} onClose={() => setPlaying(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 2,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    minHeight: 200,
    fontSize: tokens.fontSize.md,
    outlineStyle: "none" as any,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    alignSelf: "flex-start",
    paddingHorizontal: tokens.spacing["2xl"],
  },
  section: {
    gap: tokens.spacing.sm,
  },
  list: {
    gap: tokens.spacing.md,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
});
