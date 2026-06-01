import { formatDistanceToNow } from "date-fns";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";
import type { SessionSummary } from "@/features/vidya-lm/types";

type Props = {
  session: SessionSummary;
  onPress: () => void;
  onDelete: () => void;
};

const isWeb = Platform.OS === "web";

function confirmDelete(onDelete: () => void) {
  if (isWeb) {
    if (window.confirm("Delete this chat? This cannot be undone.")) onDelete();
    return;
  }
  Alert.alert("Delete chat", "This cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onDelete },
  ]);
}

export function SessionListItem({ session, onPress, onDelete }: Props) {
  const { colors } = useTheme();
  const subtitle = session.last_message_at
    ? formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true })
    : "No messages yet";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => confirmDelete(onDelete)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={{ flex: 1, marginRight: tokens.spacing.sm }}>
        <Text variant="body" style={{ color: colors.text, fontWeight: "600" }} numberOfLines={1}>
          {session.title || "New chat"}
        </Text>
        <Text variant="caption" style={{ color: colors.muted }}>
          {subtitle} · {session.message_count} msg
        </Text>
      </View>
      <Pressable onPress={() => confirmDelete(onDelete)} hitSlop={8}>
        <Text style={{ color: colors.danger, fontSize: 18 }}>×</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    marginBottom: tokens.spacing.sm,
  },
});
