import { ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { Text } from "@/shared/components/typography";

export type ActionSheetItem = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
};

const isWeb = Platform.OS === "web";

export function ActionSheet({ visible, onClose, title, items }: Props) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {title ? (
            <Text variant="caption" style={{ color: colors.muted, marginBottom: tokens.spacing.sm }}>
              {title}
            </Text>
          ) : null}
          {items.map((item, i) => (
            <Pressable
              key={`${item.label}-${i}`}
              onPress={() => {
                if (item.disabled) return;
                onClose();
                item.onPress();
              }}
              style={({ pressed }) => [
                styles.row,
                {
                  borderTopColor: colors.border,
                  borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                  opacity: item.disabled ? 0.4 : pressed ? 0.6 : 1,
                },
              ]}
            >
              {item.icon}
              <Text
                variant="body"
                style={{
                  color: item.danger ? colors.danger : colors.text,
                  marginLeft: item.icon ? tokens.spacing.sm : 0,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    borderTopLeftRadius: tokens.radii.lg,
    borderTopRightRadius: tokens.radii.lg,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: tokens.spacing.md,
  },
});
