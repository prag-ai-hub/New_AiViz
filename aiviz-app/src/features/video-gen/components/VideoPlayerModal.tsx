import { ResizeMode, Video } from "expo-av";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { VideoJob } from "@/features/video-gen/types";
import { Text } from "@/shared/components/typography";

type Props = {
  job: VideoJob | null;
  onClose: () => void;
};

export function VideoPlayerModal({ job, onClose }: Props) {
  const { colors } = useTheme();
  const videoRef = useRef<Video>(null);
  const [isLooping, setIsLooping] = useState(true);

  if (!job?.url) return null;

  return (
    <Modal
      visible={job != null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <Text variant="h3" style={{ color: colors.text }} numberOfLines={1}>
              🎬 Video
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text style={{ color: colors.muted, fontSize: 20 }}>✕</Text>
            </Pressable>
          </View>

          <View style={[styles.videoWrap, { backgroundColor: "#000" }]}>
            <Video
              ref={videoRef}
              source={{ uri: job.url }}
              style={{ flex: 1 }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={isLooping}
              useNativeControls
            />
          </View>

          <View style={styles.footer}>
            <Text variant="caption" style={{ color: colors.muted, flex: 1 }} numberOfLines={2}>
              {job.prompt}
            </Text>
            <Pressable
              onPress={() => setIsLooping((v) => !v)}
              style={({ pressed }) => [
                styles.loopBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: isLooping ? colors.primary : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: isLooping ? colors.primaryFg : colors.text,
                  fontWeight: "600",
                }}
              >
                🔁 Loop
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 720,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: tokens.spacing.md,
  },
  videoWrap: {
    aspectRatio: 16 / 9,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
    padding: tokens.spacing.md,
  },
  loopBtn: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
  },
});
