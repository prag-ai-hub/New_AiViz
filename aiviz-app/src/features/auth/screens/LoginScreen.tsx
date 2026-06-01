import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { tokens } from "@/core/theme";
import {
  AuthCard,
  AuthDivider,
  AuthFooterLink,
  EmailField,
  GoogleSignInButton,
  PasswordField,
  SubmitButton,
} from "@/features/auth/components";
import { useSignIn } from "@/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "@/features/auth/validations";

export function LoginScreen() {
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const signIn = useSignIn();

  const onSubmit = handleSubmit((values) => signIn.mutate(values));

  return (
    <AuthCard
      title="Welcome Back!"
      footer={
        <AuthFooterLink
          prompt="Don't have an account?"
          ctaLabel="Sign Up"
          href="/(auth)/signup"
        />
      }
    >
      <EmailField control={control} name="identifier" label="Email or phone" placeholder="you@example.com or +91…" />
      <PasswordField control={control} name="password" />
      <SubmitButton
        label="Sign In"
        loading={signIn.isPending}
        disabled={!formState.isValid && formState.isSubmitted}
        onPress={onSubmit}
      />
      <View style={{ height: tokens.spacing.xs }} />
      <AuthDivider />
      <GoogleSignInButton />
    </AuthCard>
  );
}
