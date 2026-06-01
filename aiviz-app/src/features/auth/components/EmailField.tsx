import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { TextField } from "@/shared/components/inputs";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
};

export function EmailField<T extends FieldValues>({
  control,
  name,
  label = "Email",
  placeholder = "you@example.com",
}: Props<T>) {
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
          keyboardType="email-address"
          textContentType="emailAddress"
          error={error?.message}
        />
      )}
    />
  );
}
