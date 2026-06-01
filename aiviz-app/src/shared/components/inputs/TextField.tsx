import { forwardRef, useState } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, rightSlot, style, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={{ gap: tokens.spacing.xs }}>
      {label ? (
        <Text variant="caption" style={{ color: colors.muted }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor,
          borderRadius: tokens.radii.md,
          backgroundColor: colors.surface,
          paddingHorizontal: tokens.spacing.md,
        }}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.muted}
          style={[
            {
              flex: 1,
              paddingVertical: tokens.spacing.md,
              color: colors.text,
              fontSize: tokens.fontSize.md,
            },
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightSlot ? <Pressable hitSlop={8}>{rightSlot}</Pressable> : null}
      </View>
      {error ? (
        <Text variant="caption" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" style={{ color: colors.muted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
