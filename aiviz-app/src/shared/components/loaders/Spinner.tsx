import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { useTheme } from "@/core/providers";

export function Spinner({ size = "small", color, ...rest }: ActivityIndicatorProps) {
  const { colors } = useTheme();
  return <ActivityIndicator size={size} color={color ?? colors.primary} {...rest} />;
}
