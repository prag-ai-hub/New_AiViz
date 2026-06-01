import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { CodeBlock, MarkdownRenderer } from "@/features/vidya-lm/components";
import type {
  ChatSource,
  CodeSource,
  ImageSource,
  NotebookEntry,
  VideoSource,
} from "@/features/library/types";
import { Text } from "@/shared/components/typography";

type Props = {
  entry: NotebookEntry | null;
  onClose: () => void;
};

export function EntryDetailModal({ entry, onClose }: Props) {
  const { colors } = useTheme();
  if (!entry) return null;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.85)" }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text variant="body" style={{ color: colors.text, fontWeight: "600", flex: 1 }}>
              {entry.title}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={{ color: colors.muted, fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: tokens.spacing.lg, gap: tokens.spacing.md }}>
            {entry.source_kind === "image_gen" ? (
              <ImageDetail src={entry.source as ImageSource | null} />
            ) : entry.source_kind === "video_gen" ? (
              <VideoDetail src={entry.source as VideoSource | null} />
            ) : entry.source_kind === "code_helper" ? (
              <CodeDetail src={entry.source as CodeSource | null} />
            ) : (
              <ChatDetail src={entry.source as ChatSource | null} />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ImageDetail({ src }: { src: ImageSource | null }) {
  const { colors } = useTheme();
  if (!src) return <Text style={{ color: colors.muted }}>Missing image source.</Text>;
  return (
    <View style={{ gap: tokens.spacing.md }}>
      {src.url ? (
        <View style={[styles.imgWrap, { backgroundColor: colors.bg }]}>
          <Image
            source={{ uri: src.url }}
            contentFit="contain"
            transition={200}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
      <Field label="Prompt" value={src.prompt} />
      {src.refined_prompt ? (
        <Field label="Refined" value={src.refined_prompt} />
      ) : null}
      <Field label="Model" value={src.model} />
      <Field label="Size" value={`${src.width} × ${src.height}`} />
    </View>
  );
}

function VideoDetail({ src }: { src: VideoSource | null }) {
  const { colors } = useTheme();
  if (!src) return <Text style={{ color: colors.muted }}>Missing video source.</Text>;
  return (
    <View style={{ gap: tokens.spacing.md }}>
      {src.url ? (
        <View style={[styles.videoWrap, { backgroundColor: "#000" }]}>
          <Video
            source={{ uri: src.url }}
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping
            shouldPlay
          />
        </View>
      ) : src.seed_image_url ? (
        <View style={[styles.imgWrap, { backgroundColor: colors.bg }]}>
          <Image
            source={{ uri: src.seed_image_url }}
            contentFit="contain"
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
      <Field label="Prompt" value={src.prompt} />
      {src.refined_prompt ? (
        <Field label="Refined" value={src.refined_prompt} />
      ) : null}
      <Field
        label="Duration"
        value={src.duration_seconds ? `${src.duration_seconds}s` : "—"}
      />
    </View>
  );
}

function CodeDetail({ src }: { src: CodeSource | null }) {
  const { colors } = useTheme();
  if (!src) return <Text style={{ color: colors.muted }}>Missing code source.</Text>;
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Field label="Action" value={src.action} />
      <Field label="Language" value={src.language} />
      <View>
        <Text variant="caption" style={{ color: colors.muted, marginBottom: 4 }}>
          Code
        </Text>
        <CodeBlock code={src.code_preview} language={src.language} />
      </View>
      <View>
        <Text variant="caption" style={{ color: colors.muted, marginBottom: 4 }}>
          Response (preview)
        </Text>
        <MarkdownRenderer content={src.response_preview} />
      </View>
    </View>
  );
}

function ChatDetail({ src }: { src: ChatSource | null }) {
  const { colors } = useTheme();
  if (!src) return <Text style={{ color: colors.muted }}>Missing chat source.</Text>;
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Field label="Messages" value={String(src.message_count)} />
      {src.last_assistant ? (
        <View>
          <Text variant="caption" style={{ color: colors.muted, marginBottom: 4 }}>
            Last assistant reply
          </Text>
          <View
            style={[
              styles.bubble,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <MarkdownRenderer content={src.last_assistant} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text variant="caption" style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text style={{ color: colors.text }}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.lg,
  },
  panel: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "90%",
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  imgWrap: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: tokens.radii.md,
    overflow: "hidden",
  },
  videoWrap: {
    aspectRatio: 16 / 9,
    width: "100%",
    borderRadius: tokens.radii.md,
    overflow: "hidden",
  },
  bubble: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
  },
});
