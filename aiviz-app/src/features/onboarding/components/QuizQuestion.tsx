import { View } from "react-native";
import { tokens } from "@/core/theme";
import type { LearningStyleValue, QuizQuestion as QuizQuestionType } from "@/features/onboarding/constants";
import { Text } from "@/shared/components/typography";
import { OptionCard } from "./OptionCard";

type Props = {
  index: number; // 1-based for display
  question: QuizQuestionType;
  value: LearningStyleValue | null;
  onChange: (style: LearningStyleValue) => void;
};

export function QuizQuestion({ index, question, value, onChange }: Props) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text variant="h3">
        {index}. {question.prompt}
      </Text>
      <View style={{ gap: tokens.spacing.sm }}>
        {question.options.map((opt) => (
          <OptionCard
            key={opt.label}
            title={opt.label}
            selected={value === opt.style}
            onPress={() => onChange(opt.style)}
          />
        ))}
      </View>
    </View>
  );
}
