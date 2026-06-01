import { format } from "date-fns";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
} from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { ImageAsset } from "@/features/image-gen/types";
import { Text } from "@/shared/components/typography";

type Props = {
  asset: ImageAsset;
  onView: () => void;
  onDelete: () => void;
};

const isWeb = Platform.OS === "web";

async function downloadImage(asset: ImageAsset): Promise<void> {
  if (!asset.url) return;
  if (isWeb) {
    const a = document.createElement("a");
    a.href = asset.url;
    a.download = `aiviz-${asset.id}.png`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  const target = `${FileSystem.cacheDirectory}aiviz-${asset.id}.png`;
  const { uri } = await FileSystem.downloadAsync(asset.url, target);
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    showToast.error({ title: "Photo permission needed" });
    return;
  }
  await MediaLibrary.saveToLibraryAsync(uri);
  showToast.success({ title: "Saved to Photos" });
}

function confirmDelete(onConfirm: () => void) {
  if (isWeb) {
    if (window.confirm("Delete this image? This cannot be undone.")) onConfirm();
    return;
  }
  Alert.alert("Delete image", "This cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}

export function MediaImageCard({ asset, onView, onDelete }: Props) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);

  const createdLabel = (() => {
    try {
      return format(new Date(asset.created_at), "MMMM dd, yyyy");
    } catch {
      return "—";
    }
  })();

  const handleDownload = async () => {
    if (!asset.url || busy) return;
    setBusy(true);
    try {
      await downloadImage(asset);
    } catch {
      showToast.error({ title: "Download failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.imgWrap, { backgroundColor: colors.bg }]}>
        {asset.url ? (
          <Image
            source={{ uri: asset.url }}
            contentFit="cover"
            transition={200}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text variant="caption" style={{ color: colors.muted }}>
              {asset.status === "failed" ? "Failed" : "Pending…"}
            </Text>
          </View>
        )}
      </View>
      <View style={{ padding: tokens.spacing.md, gap: tokens.spacing.xs }}>
        <Text variant="caption" style={{ color: colors.muted }}>
          Created on {createdLabel}
        </Text>
        <Text style={{ color: colors.text }} numberOfLines={2}>
          {asset.prompt}
        </Text>
      </View>
      <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
        <ActionBtn label="View" icon="👁" color="#3B82F6" onPress={onView} />
        <Divider />
        <ActionBtn
          label="Download"
          icon="⬇"
          color="#16A34A"
          onPress={handleDownload}
          disabled={!asset.url || busy}
        />
        <Divider />
        <ActionBtn
          label="Delete"
          icon="🗑"
          color="#DC2626"
          onPress={() => confirmDelete(onDelete)}
        />
      </View>
    </View>
  );
}

function ActionBtn({
  label,
  icon,
  color,
  onPress,
  disabled,
}: {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => [
        styles.actionBtn,
        { opacity: disabled ? 0.4 : state.pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={{ fontSize: 14, color }}>{icon}</Text>
      <Text style={{ color, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minWidth: 260,
    flexBasis: "31%",
    flexGrow: 1,
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  imgWrap: {
    aspectRatio: 4 / 3,
    width: "100%",
  },
  imgPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: tokens.spacing.md,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
  },
});
