import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import {
  CodeEditor,
  CodeHelperHeader,
  Dropdown,
  OutputPanel,
  type DropdownOption,
} from "@/features/code-helper/components";
import { useCodeHelp, useLanguages } from "@/features/code-helper/hooks";
import {
  CODE_ACTIONS,
  CODE_ACTION_LABEL,
  type CodeAction,
  type CodeLanguage,
} from "@/features/code-helper/types";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

const isWeb = Platform.OS === "web";

export function CodeHelperScreen() {
  const { colors } = useTheme();
  const languages = useLanguages();
  const params = useLocalSearchParams<{
    code?: string;
    language?: string;
    action?: string;
  }>();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<CodeLanguage | null>(null);
  const [action, setAction] = useState<CodeAction>("explain");
  const { run, cancel, status, output, isStreaming } = useCodeHelp();
  const seedAppliedRef = useRef(false);

  useEffect(() => {
    if (seedAppliedRef.current) return;
    const seedCode = typeof params.code === "string" ? params.code : "";
    const seedLang = typeof params.language === "string" ? params.language : "";
    const seedAction = typeof params.action === "string" ? params.action : "";
    if (seedCode || seedLang || seedAction) {
      if (seedCode) setCode(seedCode);
      if (seedLang) setLanguage(seedLang as CodeLanguage);
      if (seedAction && CODE_ACTIONS.includes(seedAction as CodeAction)) {
        setAction(seedAction as CodeAction);
      }
      seedAppliedRef.current = true;
    }
  }, [params.code, params.language, params.action]);

  useEffect(() => {
    if (language == null && languages.data?.default) {
      setLanguage(languages.data.default);
    }
  }, [languages.data, language]);

  const actionOptions: DropdownOption<CodeAction>[] = useMemo(
    () =>
      CODE_ACTIONS.map((a) => ({
        value: a,
        label: `${CODE_ACTION_LABEL[a]} Code`,
      })),
    [],
  );

  const languageOptions: DropdownOption<CodeLanguage>[] = useMemo(
    () =>
      (languages.data?.items ?? []).map((item) => ({
        value: item.value,
        label: item.label,
      })),
    [languages.data],
  );

  const handleAnalyze = () => {
    if (!language) return;
    if (isStreaming) {
      cancel();
      return;
    }
    run({ action, code, language });
  };

  const analyzeDisabled = !code.trim() || !language;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ gap: tokens.spacing.lg }}>
          {/* Page title */}
          <View style={styles.pageHeader}>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "monospace",
                fontWeight: "700",
                fontSize: 18,
              }}
            >
              {"</>"}
            </Text>
            <Text variant="h1" style={{ color: colors.text }}>
              AI Code Helper
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <CodeHelperHeader />

            <View style={styles.body}>
              <Text variant="caption" style={{ color: colors.muted }}>
                Your Code
              </Text>
              <View
                style={[
                  styles.editorWrap,
                  { borderColor: colors.primary, backgroundColor: colors.bg },
                ]}
              >
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language ?? "python"}
                />
              </View>

              <View style={[styles.dropdownRow, isWeb ? styles.rowWide : styles.rowNarrow]}>
                <Dropdown<CodeAction>
                  label="What would you like help with?"
                  value={action}
                  options={actionOptions}
                  onChange={setAction}
                  disabled={isStreaming}
                />
                <Dropdown<CodeLanguage>
                  label="Programming Language"
                  value={language}
                  options={languageOptions}
                  onChange={(v) => setLanguage(v)}
                  disabled={isStreaming || languages.isLoading}
                />
              </View>

              <Pressable
                onPress={handleAnalyze}
                disabled={!isStreaming && analyzeDisabled}
                style={({ pressed }) => [
                  styles.analyzeBtn,
                  {
                    backgroundColor: isStreaming
                      ? colors.danger
                      : analyzeDisabled
                        ? colors.border
                        : colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{isStreaming ? "■" : "🧠"}</Text>
                <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
                  {isStreaming ? "Stop" : "Analyze Code"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Output */}
          <View style={{ minHeight: 200 }}>
            <OutputPanel output={output} streaming={status === "streaming"} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: tokens.spacing["2xl"],
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  body: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  editorWrap: {
    height: 260,
    borderWidth: 2,
    borderRadius: tokens.radii.md,
    overflow: "hidden",
  },
  dropdownRow: {
    gap: tokens.spacing.md,
  },
  rowWide: {
    flexDirection: "row",
  },
  rowNarrow: {
    flexDirection: "column",
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    marginTop: tokens.spacing.sm,
  },
});
