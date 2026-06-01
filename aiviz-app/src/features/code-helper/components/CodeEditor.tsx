import { forwardRef, useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { CodeLanguage } from "@/features/code-helper/types";

type Props = {
  value: string;
  onChange: (next: string) => void;
  language: CodeLanguage;
  placeholder?: string;
};

const MONACO_VERSION = "0.45.0";

function buildHtml(initial: string, language: CodeLanguage, bg: string): string {
  // Single-string HTML; escapes the initial value so user code can't break out.
  const safeInitial = JSON.stringify(initial);
  const safeLang = JSON.stringify(language);
  const safeBg = JSON.stringify(bg);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  html, body, #editor { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; }
  body { background: ${bg}; }
  .loader { color: #888; font-family: -apple-system, system-ui, sans-serif; padding: 12px; }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs/editor/editor.main.css" />
</head>
<body>
<div id="editor"><div class="loader">Loading editor…</div></div>
<script src="https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs/loader.js"></script>
<script>
  var post = function (msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } else if (window.parent !== window) {
      window.parent.postMessage(JSON.stringify(msg), "*");
    }
  };
  require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs" } });
  require(["vs/editor/editor.main"], function () {
    var editor = monaco.editor.create(document.getElementById("editor"), {
      value: ${safeInitial},
      language: ${safeLang},
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      tabSize: 2,
    });
    window.__editor = editor;
    editor.onDidChangeModelContent(function () {
      post({ type: "change", value: editor.getValue() });
    });
    post({ type: "ready" });

    document.addEventListener("message", function (e) { handle(e.data); });
    window.addEventListener("message", function (e) { handle(e.data); });
  });

  function handle(raw) {
    try {
      var msg = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!msg) return;
      if (msg.type === "setValue" && window.__editor) {
        if (window.__editor.getValue() !== msg.value) {
          window.__editor.setValue(msg.value || "");
        }
      } else if (msg.type === "setLanguage" && window.__editor) {
        monaco.editor.setModelLanguage(window.__editor.getModel(), msg.language);
      }
    } catch (_) { /* ignore */ }
  }
</script>
</body>
</html>`;
}

export const CodeEditor = forwardRef<View, Props>(function CodeEditor(
  { value, onChange, language },
  ref,
) {
  const { colors } = useTheme();
  const webRef = useRef<WebView>(null);
  const lastEmittedRef = useRef<string>(value);

  const html = useMemo(() => buildHtml(value, language, colors.bg), []);
  // ^ Build once. Subsequent value/language changes go through postMessage.

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const payload = JSON.stringify({ type: "setValue", value });
    webRef.current?.injectJavaScript(`handle(${JSON.stringify(payload)}); true;`);
  }, [value]);

  useEffect(() => {
    const payload = JSON.stringify({ type: "setLanguage", language });
    webRef.current?.injectJavaScript(`handle(${JSON.stringify(payload)}); true;`);
  }, [language]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg?.type === "change" && typeof msg.value === "string") {
        lastEmittedRef.current = msg.value;
        onChange(msg.value);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <View
      ref={ref}
      style={[
        styles.wrap,
        { borderColor: colors.border, backgroundColor: colors.bg },
      ]}
    >
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        // @ts-expect-error web-only prop, ignored on native
        style={{ flex: 1, backgroundColor: colors.bg, border: 0 }}
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 240,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    overflow: "hidden",
  },
});
