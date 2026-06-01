import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

type Props = {
  size?: number;
  showWordmark?: boolean;
};

export function AivizLogo({ size = 40, showWordmark = true }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {/* outer ring */}
        <Circle cx="32" cy="32" r="29" stroke={colors.primary} strokeWidth={3} fill="none" />
        {/* stylised "A" mark — two crossing strokes */}
        <Path
          d="M 18 46 L 32 16 L 46 46 M 24 38 L 40 38"
          stroke={colors.primary}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* warm accent dot top-left, matching the orange spark in the reference */}
        <Circle cx="14" cy="14" r="6" fill="#F2A23A" />
      </Svg>
      {showWordmark ? (
        <Text
          style={{
            color: colors.primary,
            fontWeight: "700",
            fontSize: tokens.fontSize.lg,
            letterSpacing: 1,
          }}
        >
          AIVIZ LAB
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
});
