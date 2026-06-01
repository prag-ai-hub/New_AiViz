import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import {
  ChatBubble,
  ChatHeader,
  Composer,
} from "@/features/vidya-lm/components";
import {
  useCreateSession,
  useDeleteSession,
  useRenameSession,
  useSessionDetail,
  useStreamMessage,
} from "@/features/vidya-lm/hooks";
import type { Message } from "@/features/vidya-lm/types";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

const isWeb = Platform.OS === "web";

function confirm(message: string, onConfirm: () => void) {
  if (isWeb) {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert("Confirm", message, [
    { text: "Cancel", style: "cancel" },
    { text: "OK", style: "destructive", onPress: onConfirm },
  ]);
}

export function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sessionId: string; firstMessage?: string }>();
  const sessionId = Number(params.sessionId);
  const detail = useSessionDetail(Number.isFinite(sessionId) ? sessionId : null);
  const rename = useRenameSession(sessionId);
  const create = useCreateSession();
  const del = useDeleteSession();
  const { send, cancel, status, streamingText } = useStreamMessage(sessionId);

  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const listRef = useRef<FlatList<Message>>(null);
  const firstMessageSentRef = useRef(false);

  const messages = detail.data?.messages ?? [];

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages.length, streamingText]);

  useEffect(() => {
    if (firstMessageSentRef.current) return;
    if (!Number.isFinite(sessionId)) return;
    if (!detail.data) return;
    const seed =
      typeof params.firstMessage === "string" ? params.firstMessage : "";
    if (!seed) return;
    if (messages.length > 0) {
      firstMessageSentRef.current = true;
      return;
    }
    firstMessageSentRef.current = true;
    send(seed);
  }, [detail.data, sessionId, params.firstMessage, messages.length, send]);

  if (!Number.isFinite(sessionId)) {
    return (
      <Screen>
        <Text variant="body">Invalid chat.</Text>
      </Screen>
    );
  }

  const title = detail.data?.title ?? "New chat";

  const startRename = () => {
    setTitleDraft(title);
    setRenaming(true);
  };
  const commitRename = () => {
    const next = titleDraft.trim();
    if (next && next !== title) rename.mutate(next);
    setRenaming(false);
  };

  const handleNew = async () => {
    const session = await create.mutateAsync(undefined);
    router.replace(`/tools/vidya-lm/${session.id}` as never);
  };

  const handleClear = () => {
    confirm("Delete this chat? This cannot be undone.", () => {
      del.mutate(sessionId, {
        onSuccess: () => router.replace("/tools/vidya-lm" as never),
      });
    });
  };

  return (
    <Screen>
      <View style={{ flex: 1, gap: tokens.spacing.md }}>
        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={{ fontSize: 22 }}>💬</Text>
          <Text variant="h1" style={{ color: colors.text }}>
            Vidya AI Assistant
          </Text>
        </View>

        {/* Card container */}
        <View
          style={[
            styles.card,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {/* Title strip (with inline rename) */}
          {renaming ? (
            <View style={[styles.renameRow, { borderBottomColor: colors.border }]}>
              <TextInput
                value={titleDraft}
                onChangeText={setTitleDraft}
                onBlur={commitRename}
                onSubmitEditing={commitRename}
                autoFocus
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: tokens.fontSize.md,
                  fontWeight: "600",
                  outlineStyle: "none" as any,
                }}
              />
            </View>
          ) : (
            <ChatHeader
              title={title}
              onNew={handleNew}
              onClear={handleClear}
              creating={create.isPending}
              clearing={del.isPending}
            />
          )}
          <Pressable
            onPress={startRename}
            style={{ paddingHorizontal: tokens.spacing.md }}
          >
            <Text variant="caption" style={{ color: colors.muted }}>
              {renaming ? "" : "Tap title to rename"}
            </Text>
          </Pressable>

          {/* Messages */}
          {detail.isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Spinner size="large" />
            </View>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
              keyboardVerticalOffset={64}
            >
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.md,
                  gap: tokens.spacing.sm,
                }}
                renderItem={({ item }) => (
                  <ChatBubble
                    role={item.role}
                    content={item.content}
                    createdAt={item.created_at}
                  />
                )}
                ListFooterComponent={
                  status === "streaming" && streamingText ? (
                    <ChatBubble role="assistant" content={streamingText} streaming />
                  ) : null
                }
                windowSize={10}
              />
              <Composer
                streaming={status === "streaming"}
                onSend={(text) => send(text)}
                onCancel={cancel}
              />
            </KeyboardAvoidingView>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  renameRow: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
