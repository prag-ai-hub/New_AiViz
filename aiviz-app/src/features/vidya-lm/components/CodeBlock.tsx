import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  code: string;
  language?: string;
};

const isWeb = Platform.OS === "web";

export function CodeBlock({ code, language }: Props) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!isWeb) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.head}>
        <Text variant="caption" style={{ color: colors.muted }}>
          {language || "code"}
        </Text>
        {isWeb ? (
          <Pressable onPress={handleCopy} hitSlop={8}>
            <Text variant="caption" style={{ color: colors.primary }}>
              {copied ? "Copied" : "Copy"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text
        style={{
          fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
          fontSize: tokens.fontSize.sm,
          color: colors.text,
        }}
      >
        {code.replace(/\n+$/, "")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    marginVertical: tokens.spacing.sm,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: tokens.spacing.sm,
  },
});
