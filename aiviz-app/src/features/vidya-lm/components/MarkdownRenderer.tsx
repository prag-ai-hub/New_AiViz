import { Fragment, ReactNode, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";
import { CodeBlock } from "./CodeBlock";

const isWeb = Platform.OS === "web";

// Lazy-load KaTeX on web only — keep native bundle clean.
let WebMath: {
  Inline: (props: { math: string }) => ReactNode;
  Block: (props: { math: string }) => ReactNode;
} | null = null;
if (isWeb) {
  try {
    require("katex/dist/katex.min.css");
    const katex = require("react-katex");
    WebMath = {
      Inline: katex.InlineMath,
      Block: katex.BlockMath,
    };
  } catch {
    /* ignore — fall back to text */
  }
}

type Segment =
  | { kind: "text"; value: string }
  | { kind: "inlineMath"; value: string }
  | { kind: "blockMath"; value: string };

function splitMath(input: string): Segment[] {
  const segments: Segment[] = [];
  const re = /(\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: input.slice(lastIndex, match.index) });
    }
    if (match[2] != null) {
      segments.push({ kind: "blockMath", value: match[2].trim() });
    } else if (match[3] != null) {
      segments.push({ kind: "inlineMath", value: match[3].trim() });
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < input.length) {
    segments.push({ kind: "text", value: input.slice(lastIndex) });
  }
  return segments;
}

type Props = {
  content: string;
  color?: string;
};

export function MarkdownRenderer({ content, color }: Props) {
  const { colors } = useTheme();
  const textColor = color ?? colors.text;

  const segments = useMemo(() => splitMath(content), [content]);

  const mdStyle = useMemo(
    () => ({
      body: { color: textColor, fontSize: tokens.fontSize.md, lineHeight: 22 },
      heading1: { color: textColor, fontSize: tokens.fontSize.xl, fontWeight: "700" as const, marginVertical: 6 },
      heading2: { color: textColor, fontSize: tokens.fontSize.lg, fontWeight: "700" as const, marginVertical: 6 },
      heading3: { color: textColor, fontSize: tokens.fontSize.md, fontWeight: "600" as const, marginVertical: 4 },
      strong: { color: textColor, fontWeight: "700" as const },
      em: { color: textColor, fontStyle: "italic" as const },
      bullet_list: { marginVertical: 4 },
      ordered_list: { marginVertical: 4 },
      code_inline: {
        color: textColor,
        backgroundColor: colors.surface,
        borderRadius: 4,
        paddingHorizontal: 4,
        fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
      },
      link: { color: colors.primary },
      blockquote: {
        backgroundColor: colors.surface,
        borderLeftColor: colors.border,
        borderLeftWidth: 3,
        paddingLeft: 8,
      },
    }),
    [colors, textColor],
  );

  const renderRules = useMemo(
    () => ({
      fence: (node: { content: string; sourceInfo?: string }, _children: unknown, _parent: unknown, _styles: unknown) => (
        <CodeBlock key={`code-${node.content.slice(0, 8)}`} code={node.content} language={node.sourceInfo} />
      ),
      code_block: (node: { content: string }) => (
        <CodeBlock key={`code-${node.content.slice(0, 8)}`} code={node.content} />
      ),
    }),
    [],
  );

  return (
    <View>
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          if (!seg.value.trim()) return null;
          return (
            <Markdown key={`md-${i}`} style={mdStyle} rules={renderRules}>
              {seg.value}
            </Markdown>
          );
        }
        if (seg.kind === "blockMath") {
          if (isWeb && WebMath) {
            return (
              <View key={`bm-${i}`} style={styles.mathBlock}>
                <WebMath.Block math={seg.value} />
              </View>
            );
          }
          return (
            <View
              key={`bm-${i}`}
              style={[styles.mathBlockFallback, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text
                style={{
                  fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
                  color: textColor,
                }}
              >
                {seg.value}
              </Text>
            </View>
          );
        }
        // inlineMath
        if (isWeb && WebMath) {
          return (
            <Fragment key={`im-${i}`}>
              <WebMath.Inline math={seg.value} />
            </Fragment>
          );
        }
        return (
          <Text
            key={`im-${i}`}
            style={{
              fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
              color: textColor,
            }}
          >
            {seg.value}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  mathBlock: { marginVertical: tokens.spacing.sm },
  mathBlockFallback: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    marginVertical: tokens.spacing.sm,
  },
});
