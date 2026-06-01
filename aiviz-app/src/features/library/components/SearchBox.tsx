import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  value: string;
  onChange: (next: string) => void;
  delayMs?: number;
};

export function SearchBox({ value, onChange, delayMs = 300 }: Props) {
  const { colors } = useTheme();
  const [local, setLocal] = useState(value);

  // Debounce so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, delayMs]);

  // External resets propagate down.
  useEffect(() => {
    if (value !== local) setLocal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View
      style={[
        styles.wrap,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <Text style={{ color: colors.muted }}>🔍</Text>
      <TextInput
        value={local}
        onChangeText={setLocal}
        placeholder="Search your notebook…"
        placeholderTextColor={colors.muted}
        style={{
          flex: 1,
          color: colors.text,
          fontSize: tokens.fontSize.md,
          outlineStyle: "none" as any,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
});
