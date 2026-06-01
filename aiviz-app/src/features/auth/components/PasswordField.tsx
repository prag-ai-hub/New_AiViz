import { useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Pressable } from "react-native";
import { useTheme } from "@/core/providers";
import { TextField } from "@/shared/components/inputs";
import { Text } from "@/shared/components/typography";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
};

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label = "Password",
  placeholder = "Your password",
}: Props<T>) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          label={label}
          placeholder={placeholder}
          value={value as string}
          onChangeText={onChange}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!visible}
          textContentType="password"
          error={error?.message}
          rightSlot={
            <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
              <Text variant="caption" style={{ color: colors.primary }}>
                {visible ? "Hide" : "Show"}
              </Text>
            </Pressable>
          }
        />
      )}
    />
  );
}
