import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { TextField } from "@/shared/components/inputs";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

export function PhoneField<T extends FieldValues>({
  control,
  name,
  label = "Phone (optional)",
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          label={label}
          placeholder="+919876543210"
          hint="Include country code (E.164)"
          value={(value as string | undefined) ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          error={error?.message}
        />
      )}
    />
  );
}
