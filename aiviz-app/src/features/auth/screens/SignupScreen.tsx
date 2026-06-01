import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import {
  AuthCard,
  AuthDivider,
  AuthFooterLink,
  EmailField,
  GoogleSignInButton,
  PasswordField,
  PhoneField,
  SubmitButton,
} from "@/features/auth/components";
import { useSignUp } from "@/features/auth/hooks";
import { signupSchema, type SignupFormValues } from "@/features/auth/validations";
import { TextField } from "@/shared/components/inputs";
import { Text } from "@/shared/components/typography";
import { Controller } from "react-hook-form";

export function SignupScreen() {
  const { colors } = useTheme();
  const [showMore, setShowMore] = useState(false);
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", phone: "", first_name: "", last_name: "" },
  });
  const signUp = useSignUp();

  const onSubmit = handleSubmit((values) =>
    signUp.mutate({
      email: values.email,
      password: values.password,
      phone: values.phone || undefined,
      first_name: values.first_name || undefined,
      last_name: values.last_name || undefined,
    }),
  );

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to start learning your way"
      footer={<AuthFooterLink prompt="Already have an account?" ctaLabel="Sign in" href="/(auth)/login" />}
    >
      <EmailField control={control} name="email" />
      <PasswordField control={control} name="password" placeholder="At least 8 characters with a letter and a digit" />

      <Pressable onPress={() => setShowMore((v) => !v)} hitSlop={8}>
        <Text variant="caption" style={{ color: colors.primary }}>
          {showMore ? "− Hide optional details" : "+ More details (optional)"}
        </Text>
      </Pressable>

      {showMore ? (
        <View style={{ gap: tokens.spacing.md }}>
          <PhoneField control={control} name="phone" />
          <Controller
            control={control}
            name="first_name"
            render={({ field, fieldState }) => (
              <TextField
                label="First name"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="last_name"
            render={({ field, fieldState }) => (
              <TextField
                label="Last name"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      ) : null}

      <SubmitButton label="Create account" loading={signUp.isPending} onPress={onSubmit} />
      <View style={{ height: tokens.spacing.xs }} />
      <AuthDivider />
      <GoogleSignInButton />
    </AuthCard>
  );
}
