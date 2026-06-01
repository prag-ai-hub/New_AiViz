import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { ImageAsset } from "@/features/image-gen/types";
import { Text } from "@/shared/components/typography";

type Props = {
  asset: ImageAsset;
  onPress: () => void;
};

export function ImageCard({ asset, onPress }: Props) {
  const { colors } = useTheme();
  const pending = asset.status !== "succeeded" || !asset.url;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.img, { backgroundColor: colors.bg }]}>
        {pending ? (
          <View style={styles.placeholder}>
            <Text variant="caption" style={{ color: colors.muted }}>
              {asset.status === "failed" ? "Failed" : "Pending…"}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: asset.url! }}
            contentFit="cover"
            transition={200}
            style={{ flex: 1 }}
          />
        )}
      </View>
      <Text
        variant="caption"
        style={{ color: colors.text, padding: tokens.spacing.sm }}
        numberOfLines={2}
      >
        {asset.prompt}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    overflow: "hidden",
    margin: tokens.spacing.xs,
  },
  img: {
    aspectRatio: 1,
    width: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
