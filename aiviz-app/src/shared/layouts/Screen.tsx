import { ReactNode } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";

type Props = {
  children: ReactNode;
  padded?: boolean;
  /** Kept for back-compat; the screen is now always full-width on web because
   * the sidebar already provides the visual boundary. */
  fullWidth?: boolean;
  style?: ViewStyle;
};

const isWeb = Platform.OS === "web";

export function Screen({ children, padded = true, style }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const horizontalPad = padded ? (isWeb ? tokens.spacing.xl : tokens.spacing.lg) : 0;
  const verticalPad = padded ? (isWeb ? tokens.spacing.lg : 0) : 0;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
      }}
    >
      <View
        style={[
          {
            flex: 1,
            width: "100%",
            paddingTop: insets.top + verticalPad,
            paddingBottom: insets.bottom + verticalPad,
            paddingHorizontal: horizontalPad,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
