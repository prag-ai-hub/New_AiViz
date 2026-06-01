import { formatDistanceToNow } from "date-fns";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";
import type { Role } from "@/features/vidya-lm/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

type Props = {
  role: Role;
  content: string;
  streaming?: boolean;
  createdAt?: string;
};

function formatTime(iso?: string): string {
  if (!iso) return "Now";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export function ChatBubble({ role, content, streaming, createdAt }: Props) {
  const { colors } = useTheme();
  const isUser = role === "user";

  const avatarBg = isUser ? colors.primary : "#F59E0B"; // amber for assistant
  const avatarText = isUser ? "You" : "VA";

  const Avatar = (
    <View
      style={[
        styles.avatar,
        { backgroundColor: avatarBg },
      ]}
    >
      <Text style={{ color: colors.primaryFg, fontWeight: "700", fontSize: 10 }}>
        {avatarText}
      </Text>
    </View>
  );

  return (
    <View style={[styles.row, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
      {!isUser && Avatar}

      <View
        style={[
          styles.column,
          {
            alignItems: isUser ? "flex-end" : "flex-start",
            marginLeft: isUser ? 0 : tokens.spacing.sm,
            marginRight: isUser ? tokens.spacing.sm : 0,
          },
        ]}
      >
        {!isUser ? (
          <Text variant="caption" style={{ color: colors.muted, marginBottom: 2 }}>
            Vidya Assistant
          </Text>
        ) : null}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? colors.primary : colors.bg,
              borderColor: isUser ? colors.primary : colors.border,
            },
          ]}
        >
          {isUser ? (
            <Text style={{ color: colors.primaryFg }}>{content}</Text>
          ) : (
            <MarkdownRenderer content={content} color={colors.text} />
          )}
          {streaming ? (
            <Text style={{ color: colors.muted, marginTop: 2 }}>▍</Text>
          ) : null}
        </View>
        <Text variant="caption" style={{ color: colors.muted, marginTop: 2, fontSize: 10 }}>
          {formatTime(createdAt)}
        </Text>
      </View>

      {isUser && Avatar}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: tokens.spacing.xs,
  },
  column: {
    maxWidth: "82%",
    flexShrink: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
});
