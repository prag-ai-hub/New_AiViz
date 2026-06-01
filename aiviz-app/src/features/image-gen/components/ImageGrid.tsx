import { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { useImageHistory } from "@/features/image-gen/hooks";
import type { ImageAsset } from "@/features/image-gen/types";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { ImageCard } from "./ImageCard";

type Props = {
  onOpen: (asset: ImageAsset) => void;
};

export function ImageGrid({ onOpen }: Props) {
  const { colors } = useTheme();
  const q = useImageHistory();

  const items: ImageAsset[] = useMemo(() => {
    const pages = q.data?.pages ?? [];
    return pages.flatMap((p) => p.results);
  }, [q.data]);

  if (q.isLoading) {
    return (
      <View style={styles.center}>
        <Spinner size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="body" style={{ color: colors.muted }}>
          No images yet — generate your first one above.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ImageCard asset={item} onPress={() => onOpen(item)} />
      )}
      numColumns={2}
      contentContainerStyle={{ paddingBottom: tokens.spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching && !q.isFetchingNextPage}
          onRefresh={() => q.refetch()}
          tintColor={colors.primary}
        />
      }
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
      }}
      ListFooterComponent={
        q.isFetchingNextPage ? (
          <View style={{ paddingVertical: tokens.spacing.md }}>
            <Spinner size="small" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: tokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});
