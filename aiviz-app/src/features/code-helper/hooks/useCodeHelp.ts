import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { showToast } from "@/core/providers";
import { OpenAIUnavailableError, QuotaError } from "@/features/vidya-lm/api";
import { streamCode } from "@/features/code-helper/api";
import type { CodeAction, CodeLanguage } from "@/features/code-helper/types";

type Status = "idle" | "streaming" | "done" | "error";

export function useCodeHelp() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("");
  const [activeAction, setActiveAction] = useState<CodeAction | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef("");

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(
    async (args: {
      action: CodeAction;
      code: string;
      language: CodeLanguage;
      extra?: string;
    }) => {
      const code = args.code.trim();
      if (!code) {
        showToast.error({ title: "Add some code first" });
        return;
      }
      if (status === "streaming") return;

      setStatus("streaming");
      setActiveAction(args.action);
      setOutput("");
      bufferRef.current = "";

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamCode({
          action: args.action,
          code,
          language: args.language,
          extra: args.extra ?? "",
          signal: controller.signal,
          onDelta: (text) => {
            bufferRef.current += text;
            setOutput(bufferRef.current);
          },
          onDone: () => setStatus("done"),
          onError: (err) => {
            setStatus("error");
            if (err instanceof QuotaError) {
              showToast.error({
                title: "Daily limit reached",
                message: "Tap to upgrade for unlimited code help.",
              });
              router.push("/(tabs)/profile/billing" as never);
            } else if (err instanceof OpenAIUnavailableError) {
              showToast.error({
                title: "Code Helper is offline",
                message: "Server is missing the OpenAI key.",
              });
            } else {
              showToast.error({
                title: "Request failed",
                message: "Please try again.",
              });
            }
          },
        });
      } finally {
        abortRef.current = null;
      }
    },
    [router, status],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setStatus("idle");
    setActiveAction(null);
    bufferRef.current = "";
  }, []);

  return {
    run,
    cancel,
    reset,
    status,
    output,
    activeAction,
    isStreaming: status === "streaming",
  };
}
