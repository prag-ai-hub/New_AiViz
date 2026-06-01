import { useRouter } from "expo-router";
import {
  OnboardingFooter,
  OnboardingShell,
  OptionCard,
} from "@/features/onboarding/components";
import { LANGUAGES, stepIndex } from "@/features/onboarding/constants";
import { useOnboardingStore } from "@/features/onboarding/state";

export function LanguageStep() {
  const router = useRouter();
  const lang = useOnboardingStore((s) => s.lang);
  const setLang = useOnboardingStore((s) => s.setLang);

  const goNext = () => router.push("/(auth)/onboarding/learning-style");

  return (
    <OnboardingShell
      stepNumber={stepIndex("/(auth)/onboarding/language")}
      title="Which language do you prefer?"
      subtitle="We'll translate the app + AI replies."
      footer={
        <OnboardingFooter
          onPrimary={goNext}
          primaryDisabled={lang === null}
          onSkipStep={goNext}
        />
      }
    >
      {LANGUAGES.map((l) => (
        <OptionCard
          key={l.value}
          title={l.label}
          subtitle={l.hint}
          selected={lang === l.value}
          onPress={() => setLang(l.value)}
        />
      ))}
    </OnboardingShell>
  );
}
