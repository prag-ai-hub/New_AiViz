import { Link } from "expo-router";
import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  prompt: string;
  ctaLabel: string;
  href: "/(auth)/login" | "/(auth)/signup";
};

export function AuthFooterLink({ prompt, ctaLabel, href }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: tokens.spacing.xs, alignItems: "center" }}>
      <Text variant="caption" style={{ color: colors.muted }}>
        {prompt}
      </Text>
      <Link href={href} asChild>
        <Text variant="caption" style={{ color: colors.primary, fontWeight: tokens.fontWeight.semibold }}>
          {ctaLabel}
        </Text>
      </Link>
    </View>
  );
}
