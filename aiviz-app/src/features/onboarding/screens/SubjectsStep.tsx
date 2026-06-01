import { useRouter } from "expo-router";
import { View } from "react-native";
import { tokens } from "@/core/theme";
import {
  OnboardingFooter,
  OnboardingShell,
  SubjectChip,
} from "@/features/onboarding/components";
import { stepIndex, SUBJECTS } from "@/features/onboarding/constants";
import { useOnboardingStore } from "@/features/onboarding/state";

export function SubjectsStep() {
  const router = useRouter();
  const subjects = useOnboardingStore((s) => s.subjects);
  const setSubjects = useOnboardingStore((s) => s.setSubjects);

  const toggle = (value: string) => {
    if (subjects.includes(value)) setSubjects(subjects.filter((s) => s !== value));
    else setSubjects([...subjects, value]);
  };

  const goNext = () => router.push("/(auth)/onboarding/language");

  return (
    <OnboardingShell
      stepNumber={stepIndex("/(auth)/onboarding/subjects")}
      title="Which subjects are you most interested in?"
      subtitle="Pick as many as you like."
      footer={<OnboardingFooter onPrimary={goNext} onSkipStep={goNext} />}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
        {SUBJECTS.map((s) => (
          <SubjectChip
            key={s.value}
            label={s.label}
            selected={subjects.includes(s.value)}
            onPress={() => toggle(s.value)}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
