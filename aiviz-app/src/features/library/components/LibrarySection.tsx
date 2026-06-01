import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  title: string;
  children: ReactNode;
};

export function LibrarySection({ title, children }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text variant="h2" style={{ color: colors.text }}>
        {title}
      </Text>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
});
