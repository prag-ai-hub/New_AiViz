import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { VideoJobStatus } from "@/features/video-gen/types";
import { Text } from "@/shared/components/typography";

const LABEL: Record<VideoJobStatus, string> = {
  pending: "Queued",
  running: "Rendering",
  succeeded: "Ready",
  failed: "Failed",
  canceled: "Canceled",
};

const EMOJI: Record<VideoJobStatus, string> = {
  pending: "⏳",
  running: "🎞️",
  succeeded: "✅",
  failed: "⚠️",
  canceled: "⛔",
};

export function JobStatusBadge({ status }: { status: VideoJobStatus }) {
  const { colors } = useTheme();

  const bg =
    status === "succeeded"
      ? "rgba(34,197,94,0.18)"
      : status === "failed"
        ? "rgba(239,68,68,0.18)"
        : status === "canceled"
          ? colors.border
          : status === "running"
            ? "rgba(31,190,214,0.22)"
            : colors.border;

  const fg =
    status === "succeeded"
      ? "#22c55e"
      : status === "failed"
        ? "#ef4444"
        : status === "canceled"
          ? colors.muted
          : status === "running"
            ? colors.primary
            : colors.muted;

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>
        {EMOJI[status]} {LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
  },
  text: {
    fontSize: tokens.fontSize.xs,
    fontWeight: "600",
  },
});
