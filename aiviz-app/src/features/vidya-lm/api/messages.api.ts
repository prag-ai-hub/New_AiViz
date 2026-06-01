import { getAccessToken } from "@/core/storage/token.storage";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export class QuotaError extends Error {
  scope?: string;
  constructor(message = "Daily limit reached", scope?: string) {
    super(message);
    this.name = "QuotaError";
    this.scope = scope;
  }
}

export class OpenAIUnavailableError extends Error {
  constructor(message = "Vidya is offline (server key missing)") {
    super(message);
    this.name = "OpenAIUnavailableError";
  }
}

export class StreamError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "StreamError";
    this.status = status;
  }
}

export type StreamMessageArgs = {
  sessionId: number;
  content: string;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
};

function parseSseLine(line: string): { delta?: string; done?: boolean } | null {
  if (!line.startsWith("data:")) return null;
  const payload = line.slice(5).trim();
  if (!payload) return null;
  if (payload === "[DONE]") return { done: true };
  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed.delta === "string") return { delta: parsed.delta };
    if (parsed.done === true) return { done: true };
    return null;
  } catch {
    return null;
  }
}

export async function streamMessage(args: StreamMessageArgs): Promise<void> {
  const { sessionId, content, signal, onDelta, onDone, onError } = args;

  let response: Response;
  try {
    const token = await getAccessToken();
    response = await fetch(`${BASE}/api/v1/lm/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal,
    });
  } catch (err) {
    const e = err instanceof Error ? err : new StreamError("Network error");
    onError?.(e);
    throw e;
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      /* ignore */
    }
    let err: Error;
    if (response.status === 402) {
      const scope =
        (detail as { error?: { detail?: { scope?: string } } })?.error?.detail
          ?.scope ?? undefined;
      err = new QuotaError("Daily limit reached", scope);
    } else if (response.status === 503) {
      err = new OpenAIUnavailableError();
    } else {
      err = new StreamError(
        `Message request failed (${response.status})`,
        response.status,
      );
    }
    onError?.(err);
    throw err;
  }

  const body = response.body;
  if (!body) {
    const err = new StreamError("Streaming not supported in this environment");
    onError?.(err);
    throw err;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        for (const line of frame.split("\n")) {
          const parsed = parseSseLine(line);
          if (!parsed) continue;
          if (parsed.delta) onDelta(parsed.delta);
          if (parsed.done) {
            onDone?.();
            return;
          }
        }
      }
    }
    // Flush any trailing frame without double newline.
    const tail = buffer.trim();
    if (tail) {
      for (const line of tail.split("\n")) {
        const parsed = parseSseLine(line);
        if (parsed?.delta) onDelta(parsed.delta);
        if (parsed?.done) {
          onDone?.();
          return;
        }
      }
    }
    onDone?.();
  } catch (err) {
    if (signal?.aborted) {
      // Client cancelled — silent completion; backend already persisted partial.
      onDone?.();
      return;
    }
    const e = err instanceof Error ? err : new StreamError(String(err));
    onError?.(e);
    throw e;
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
  }
}
