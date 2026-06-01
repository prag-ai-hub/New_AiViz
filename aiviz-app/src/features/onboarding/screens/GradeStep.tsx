import { useRouter } from "expo-router";
import { View } from "react-native";
import { tokens } from "@/core/theme";
import {
  OnboardingFooter,
  OnboardingShell,
  OptionCard,
} from "@/features/onboarding/components";
import { GRADES, stepIndex } from "@/features/onboarding/constants";
import { useOnboardingStore } from "@/features/onboarding/state";

export function GradeStep() {
  const router = useRouter();
  const grade = useOnboardingStore((s) => s.grade);
  const setGrade = useOnboardingStore((s) => s.setGrade);

  const goNext = () => router.push("/(auth)/onboarding/board");

  return (
    <OnboardingShell
      stepNumber={stepIndex("/(auth)/onboarding/grade")}
      title="What grade are you in?"
      subtitle="We'll tune lessons to your level."
      footer={
        <OnboardingFooter
          onPrimary={goNext}
          primaryDisabled={grade === null}
          onSkipStep={goNext}
        />
      }
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
        {GRADES.map((n) => (
          <View key={n} style={{ width: "30%" }}>
            <OptionCard
              title={`Grade ${n}`}
              selected={grade === n}
              onPress={() => setGrade(n)}
            />
          </View>
        ))}
      </View>
    </OnboardingShell>
  );
}
