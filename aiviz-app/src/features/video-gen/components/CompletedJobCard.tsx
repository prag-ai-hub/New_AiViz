import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { VideoJob } from "@/features/video-gen/types";
import { Text } from "@/shared/components/typography";

type Props = {
  job: VideoJob;
  onPress: () => void;
};

export function CompletedJobCard({ job, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.thumbWrap, { backgroundColor: colors.bg }]}>
        {job.seed_image_url ? (
          <Image
            source={{ uri: job.seed_image_url }}
            contentFit="cover"
            transition={150}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.center}>
            <Text style={{ fontSize: 28 }}>🎬</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <View
            style={[styles.playBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}
          >
            <Text style={{ color: "#fff", fontSize: 22 }}>▶</Text>
          </View>
        </View>
      </View>
      <View style={{ padding: tokens.spacing.md, gap: 4 }}>
        <Text variant="body" style={{ color: colors.text }} numberOfLines={2}>
          {job.prompt}
        </Text>
        <Text variant="caption" style={{ color: colors.muted }}>
          {job.duration_seconds ? `${job.duration_seconds}s` : "Video"} · tap to
          play
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  thumbWrap: {
    aspectRatio: 16 / 9,
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
