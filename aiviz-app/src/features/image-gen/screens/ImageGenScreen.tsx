import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { ImageViewerModal } from "@/features/image-gen/components";
import { useGenerateImage } from "@/features/image-gen/hooks";
import type { ImageAsset } from "@/features/image-gen/types";
import { AssistantCard } from "@/shared/components/cards";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function ImageGenScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ prompt?: string }>();
  const [prompt, setPrompt] = useState("");
  const [latest, setLatest] = useState<ImageAsset | null>(null);
  const [viewer, setViewer] = useState<ImageAsset | null>(null);
  const seedAppliedRef = useRef(false);

  useEffect(() => {
    if (seedAppliedRef.current) return;
    const seed = params.prompt;
    if (seed && typeof seed === "string") {
      setPrompt(seed);
      seedAppliedRef.current = true;
    }
  }, [params.prompt]);

  const generate = useGenerateImage({
    onSuccess: (asset) => {
      setLatest(asset);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generate.mutate({ prompt: prompt.trim() });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tokens.spacing["2xl"] }}
      >
        <AssistantCard
          pageIcon="🖼️"
          pageTitle="Text-to-Image Generator"
          headerIcon="🎨"
          headerTitle="AI Image Assistant"
          headerSubtitle="Transform your ideas into stunning visuals using advanced AI image generation."
        >
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            multiline
            editable={!generate.isPending}
            placeholder="Describe the image you want to generate..."
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
            disabled={!prompt.trim() || generate.isPending}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor:
                  prompt.trim() && !generate.isPending
                    ? colors.primary
                    : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {generate.isPending ? (
              <Spinner size="small" color={colors.primaryFg} />
            ) : (
              <Text style={{ fontSize: 16 }}>🤖</Text>
            )}
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
              {generate.isPending ? "Generating…" : "Generate Image"}
            </Text>
          </Pressable>
        </AssistantCard>

        <View style={{ marginTop: tokens.spacing.lg }}>
          <Text
            variant="body"
            style={{
              color: colors.text,
              fontWeight: "600",
              marginBottom: tokens.spacing.sm,
            }}
          >
            Your latest generation
          </Text>
          {latest && latest.url ? (
            <Pressable
              onPress={() => setViewer(latest)}
              style={[
                styles.latestCard,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={[styles.imgWrap, { backgroundColor: colors.bg }]}>
                <Image
                  source={{ uri: latest.url }}
                  contentFit="cover"
                  transition={200}
                  style={{ flex: 1 }}
                />
              </View>
              <Text
                variant="body"
                style={{ color: colors.text, padding: tokens.spacing.md }}
                numberOfLines={3}
              >
                {latest.prompt}
              </Text>
              <Text
                variant="caption"
                style={{
                  color: colors.muted,
                  paddingHorizontal: tokens.spacing.md,
                  paddingBottom: tokens.spacing.md,
                }}
              >
                Tap to view full size · all past images live in the Library tab
              </Text>
            </Pressable>
          ) : (
            <View
              style={[
                styles.emptyCard,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text variant="body" style={{ color: colors.muted }}>
                Your newly generated image will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ImageViewerModal asset={viewer} onClose={() => setViewer(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 2,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    minHeight: 280,
    fontSize: tokens.fontSize.md,
    outlineStyle: "none" as any,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing["2xl"],
    borderRadius: tokens.radii.md,
    alignSelf: "flex-start",
  },
  latestCard: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
    maxWidth: 520,
  },
  imgWrap: {
    aspectRatio: 1,
    width: "100%",
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
