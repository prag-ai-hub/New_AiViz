import { format } from "date-fns";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "@/core/providers";
import { showToast } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { ImageAsset } from "@/features/image-gen/types";
import { Text } from "@/shared/components/typography";

type Props = {
  asset: ImageAsset | null;
  onClose: () => void;
};

const isWeb = Platform.OS === "web";

async function downloadAsset(asset: ImageAsset): Promise<void> {
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

async function shareAsset(asset: ImageAsset): Promise<void> {
  if (!asset.url) return;

  if (isWeb) {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: "AIVIZ image", url: asset.url });
        return;
      } catch {
        // user dismissed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(asset.url);
      showToast.success({ title: "Link copied" });
    } catch {
      showToast.error({ title: "Couldn't copy link" });
    }
    return;
  }

  const target = `${FileSystem.cacheDirectory}aiviz-${asset.id}.png`;
  const { uri } = await FileSystem.downloadAsync(asset.url, target);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}

export function ImageViewerModal({ asset, onClose }: Props) {
  const { colors } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!asset) return null;

  const handleDownload = async () => {
    if (downloading || !asset.url) return;
    setDownloading(true);
    try {
      await downloadAsset(asset);
    } catch {
      showToast.error({ title: "Download failed" });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (sharing || !asset.url) return;
    setSharing(true);
    try {
      await shareAsset(asset);
    } catch {
      showToast.error({ title: "Share failed" });
    } finally {
      setSharing(false);
    }
  };

  const styleLabel = asset.style ? asset.style.replaceAll("_", " ") : "no style";

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.85)" }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.imgWrap}>
            {asset.url ? (
              <Image
                source={{ uri: asset.url }}
                contentFit="contain"
                transition={200}
                style={{ flex: 1 }}
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ color: colors.muted }}>No image</Text>
              </View>
            )}
          </View>

          <View style={styles.meta}>
            <Text style={{ color: colors.text, fontWeight: "600" }} numberOfLines={3}>
              {asset.prompt}
            </Text>
            <Text variant="caption" style={{ color: colors.muted, marginTop: 4 }}>
              {styleLabel} · {asset.width}×{asset.height} ·{" "}
              {format(new Date(asset.created_at), "PP p")}
            </Text>
          </View>

          <View style={styles.actions}>
            <ActionButton
              label={downloading ? "…" : "Download"}
              onPress={handleDownload}
              disabled={downloading || !asset.url}
              color={colors.primaryFg}
              bg={colors.primary}
            />
            <ActionButton
              label={sharing ? "…" : "Share"}
              onPress={handleShare}
              disabled={sharing || !asset.url}
              color={colors.text}
              bg={colors.bg}
              border={colors.border}
            />
            <ActionButton
              label="Close"
              onPress={onClose}
              color={colors.text}
              bg={colors.bg}
              border={colors.border}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  color,
  bg,
  border,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  bg: string;
  border?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border ?? bg,
          borderWidth: border ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {disabled && label === "…" ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={{ color, fontWeight: "600" }}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.lg,
  },
  panel: {
    width: "100%",
    maxWidth: 560,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    overflow: "hidden",
  },
  imgWrap: {
    aspectRatio: 1,
    width: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
