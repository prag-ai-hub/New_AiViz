import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import {
  useCancelVideoJob,
  useVideoJob,
} from "@/features/video-gen/hooks";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { JobStatusBadge } from "./JobStatusBadge";
import { QueuePositionPill } from "./QueuePositionPill";

type Props = {
  jobId: number;
};

export function ActiveJobCard({ jobId }: Props) {
  const { colors } = useTheme();
  const { data: job, isLoading } = useVideoJob(jobId);
  const cancel = useCancelVideoJob();

  if (isLoading || !job) {
    return (
      <View
        style={[
          styles.card,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <Spinner size="small" />
      </View>
    );
  }

  if (job.status === "succeeded" || job.status === "canceled") return null;

  return (
    <View
      style={[
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.row}>
        <JobStatusBadge status={job.status} />
        {job.status === "pending" ? (
          <QueuePositionPill position={job.queue_position} />
        ) : null}
        {job.status === "running" ? <Spinner size="small" /> : null}
      </View>

      <Text
        variant="body"
        style={{ color: colors.text, marginTop: tokens.spacing.sm }}
        numberOfLines={3}
      >
        {job.prompt}
      </Text>

      {job.status === "failed" ? (
        <Text
          variant="caption"
          style={{ color: "#ef4444", marginTop: tokens.spacing.xs }}
          numberOfLines={2}
        >
          {job.error || "Generation failed."}
        </Text>
      ) : null}

      {job.status === "pending" ? (
        <Pressable
          onPress={() => cancel.mutate(job.id)}
          disabled={cancel.isPending}
          style={({ pressed }) => [
            styles.cancelBtn,
            {
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text variant="caption" style={{ color: colors.muted }}>
            Cancel
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    flexWrap: "wrap",
  },
  cancelBtn: {
    alignSelf: "flex-start",
    marginTop: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
  },
});
