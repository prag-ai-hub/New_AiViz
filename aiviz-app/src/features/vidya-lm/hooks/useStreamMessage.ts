import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { showToast } from "@/core/providers";
import {
  OpenAIUnavailableError,
  QuotaError,
  streamMessage,
} from "@/features/vidya-lm/api";
import type { Message, SessionDetail } from "@/features/vidya-lm/types";
import { sessionDetailKey } from "./useSessionDetail";

type Status = "idle" | "streaming" | "done" | "error";

let optimisticId = -1;
const nextOptimisticId = () => optimisticId--;

export function useStreamMessage(sessionId: number) {
  const qc = useQueryClient();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef("");

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || status === "streaming") return;

      const optimisticUser: Message = {
        id: nextOptimisticId(),
        role: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      qc.setQueryData<SessionDetail | undefined>(
        sessionDetailKey(sessionId),
        (prev) =>
          prev
            ? { ...prev, messages: [...prev.messages, optimisticUser] }
            : prev,
      );

      setStatus("streaming");
      setStreamingText("");
      bufferRef.current = "";

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamMessage({
          sessionId,
          content: trimmed,
          signal: controller.signal,
          onDelta: (text) => {
            bufferRef.current += text;
            setStreamingText(bufferRef.current);
          },
          onDone: () => {
            setStatus("done");
          },
          onError: (err) => {
            setStatus("error");
            if (err instanceof QuotaError) {
              showToast.error({
                title: "Daily limit reached",
                message: "Tap to upgrade for unlimited chats.",
              });
              router.push("/(tabs)/profile/billing" as never);
            } else if (err instanceof OpenAIUnavailableError) {
              showToast.error({
                title: "Vidya is offline",
                message: "Server is missing the OpenAI key.",
              });
            } else {
              showToast.error({
                title: "Reply failed",
                message: "Please try again.",
              });
            }
          },
        });
      } finally {
        abortRef.current = null;
        setStreamingText("");
        bufferRef.current = "";
        // Refresh the persisted thread (replaces optimistic + adds assistant row).
        qc.invalidateQueries({ queryKey: sessionDetailKey(sessionId) });
      }
    },
    [qc, router, sessionId, status],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { send, cancel, status, streamingText };
}
