import { format } from "date-fns";
import { Image } from "expo-image";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
} from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type {
  ChatSource,
  CodeSource,
  ImageSource,
  NotebookEntry,
  VideoSource,
} from "@/features/library/types";
import { Text } from "@/shared/components/typography";

type Props = {
  entry: NotebookEntry;
  onView: () => void;
  onUseAsInput: () => void;
  onDelete: () => void;
};

const isWeb = Platform.OS === "web";

function confirmDelete(onConfirm: () => void) {
  if (isWeb) {
    if (window.confirm("Remove this from your notebook? The original source asset stays.")) {
      onConfirm();
    }
    return;
  }
  Alert.alert(
    "Remove from notebook",
    "The original source asset stays in its tool.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onConfirm },
    ],
  );
}

export function NotebookEntryCard({ entry, onView, onUseAsInput, onDelete }: Props) {
  const { colors } = useTheme();

  const createdLabel = (() => {
    try {
      return format(new Date(entry.updated_at || entry.created_at), "MMM dd, yyyy");
    } catch {
      return "—";
    }
  })();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Preview entry={entry} />
      <View style={styles.body}>
        <View style={styles.head}>
          <Text style={{ fontSize: 14 }}>{kindIcon(entry.source_kind)}</Text>
          <Text
            style={{ flex: 1, color: colors.text, fontWeight: "600" }}
            numberOfLines={1}
          >
            {entry.title || "Untitled"}
          </Text>
        </View>
        <Text variant="caption" style={{ color: colors.muted, marginTop: 2 }}>
          {createdLabel}
        </Text>
        {entry.summary ? (
          <Text
            variant="caption"
            style={{ color: colors.text, marginTop: tokens.spacing.xs }}
            numberOfLines={2}
          >
            {entry.summary}
          </Text>
        ) : null}
        {entry.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {entry.tags.slice(0, 3).map((t) => (
              <View
                key={t.id}
                style={[
                  styles.tagChip,
                  { backgroundColor: "rgba(31,190,214,0.12)", borderColor: colors.primary },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 11 }}>{t.name}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
        <ActionBtn label="View" icon="👁" color="#3B82F6" onPress={onView} />
        <Divider />
        <ActionBtn
          label="Use as input"
          icon="🔁"
          color="#16A34A"
          onPress={onUseAsInput}
        />
        <Divider />
        <ActionBtn
          label="Delete"
          icon="🗑"
          color="#DC2626"
          onPress={() => confirmDelete(onDelete)}
        />
      </View>
    </View>
  );
}

function kindIcon(kind: NotebookEntry["source_kind"]): string {
  switch (kind) {
    case "image_gen":
      return "🖼️";
    case "video_gen":
      return "🎬";
    case "code_helper":
      return "💻";
    case "vidya_lm":
      return "💬";
  }
}

function Preview({ entry }: { entry: NotebookEntry }) {
  const { colors } = useTheme();

  if (entry.source_kind === "image_gen") {
    const src = entry.source as ImageSource | null;
    return (
      <View style={[styles.imgWrap, { backgroundColor: colors.bg }]}>
        {src?.url ? (
          <Image
            source={{ uri: src.url }}
            contentFit="cover"
            transition={200}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.center}>
            <Text variant="caption" style={{ color: colors.muted }}>
              No preview
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (entry.source_kind === "video_gen") {
    const src = entry.source as VideoSource | null;
    return (
      <View style={[styles.imgWrap, { backgroundColor: colors.bg }]}>
        {src?.seed_image_url ? (
          <Image
            source={{ uri: src.seed_image_url }}
            contentFit="cover"
            transition={200}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.center}>
            <Text style={{ fontSize: 28 }}>🎬</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playBadge}>
            <Text style={{ color: "#fff", fontSize: 16 }}>▶</Text>
          </View>
        </View>
      </View>
    );
  }

  if (entry.source_kind === "code_helper") {
    const src = entry.source as CodeSource | null;
    return (
      <View style={[styles.codeWrap, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text variant="caption" style={{ color: colors.muted, marginBottom: 4 }}>
          {src?.language || "code"} · {src?.action || ""}
        </Text>
        <Text
          style={{
            color: colors.text,
            fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
            fontSize: 12,
          }}
          numberOfLines={6}
        >
          {src?.code_preview || ""}
        </Text>
      </View>
    );
  }

  // chat
  const src = entry.source as ChatSource | null;
  return (
    <View style={[styles.chatWrap, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text variant="caption" style={{ color: colors.muted, marginBottom: 4 }}>
        💬 {src?.message_count ?? 0} messages
      </Text>
      <Text
        style={{ color: colors.text, fontStyle: "italic" }}
        numberOfLines={4}
      >
        {src?.last_assistant || "No assistant reply yet."}
      </Text>
    </View>
  );
}

function ActionBtn({
  label,
  icon,
  color,
  onPress,
  disabled,
}: {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => [
        styles.actionBtn,
        { opacity: disabled ? 0.4 : state.pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={{ fontSize: 13, color }}>{icon}</Text>
      <Text style={{ color, fontWeight: "600", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minWidth: 280,
    flexBasis: "31%",
    flexGrow: 1,
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  imgWrap: {
    aspectRatio: 4 / 3,
    width: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  codeWrap: {
    padding: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 140,
  },
  chatWrap: {
    padding: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 140,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: tokens.spacing.xs,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: tokens.spacing.md,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
  },
});
