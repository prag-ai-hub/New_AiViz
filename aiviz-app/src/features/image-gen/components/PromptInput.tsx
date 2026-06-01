import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

const MAX = 1000;

export function PromptInput({ value, onChange, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: tokens.spacing.xs }}>
      <Text variant="caption" style={{ color: colors.muted }}>
        Prompt
      </Text>
      <View
        style={[
          styles.box,
          { borderColor: colors.border, backgroundColor: colors.bg },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.slice(0, MAX))}
          editable={!disabled}
          placeholder="Describe the image you want…"
          placeholderTextColor={colors.muted}
          multiline
          style={{
            minHeight: 80,
            color: colors.text,
            fontSize: tokens.fontSize.md,
            outlineStyle: "none" as any,
          }}
        />
      </View>
      <Text variant="caption" style={{ color: colors.muted, alignSelf: "flex-end" }}>
        {value.length}/{MAX}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
});
