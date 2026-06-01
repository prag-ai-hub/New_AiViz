import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { useVoiceInput } from "@/features/vidya-lm/hooks";
import { Text } from "@/shared/components/typography";

type Props = {
  onSend: (text: string) => void;
  onCancel?: () => void;
  streaming?: boolean;
  disabled?: boolean;
};

const isWeb = Platform.OS === "web";

export function Composer({ onSend, onCancel, streaming, disabled }: Props) {
  const { colors } = useTheme();
  const [value, setValue] = useState("");
  const voice = useVoiceInput();

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || streaming || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const toggleMic = async () => {
    if (voice.isRecording) {
      const text = await voice.stop();
      if (text) setValue((prev) => (prev ? `${prev} ${text}` : text));
    } else if (!voice.isTranscribing) {
      await voice.start();
    }
  };

  const onKeyPress = (e: any) => {
    if (!isWeb) return;
    if (e.nativeEvent?.key === "Enter" && !e.nativeEvent?.shiftKey) {
      e.preventDefault?.();
      send();
    }
  };

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border }]}>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityLabel="Voice input"
          onPress={toggleMic}
          disabled={streaming || disabled}
          hitSlop={8}
          style={styles.iconBtn}
        >
          {voice.isTranscribing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={{ fontSize: 20, color: voice.isRecording ? colors.danger : colors.muted }}>
              {voice.isRecording ? "■" : "🎤"}
            </Text>
          )}
        </Pressable>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Ask Vidya anything..."
          placeholderTextColor={colors.muted}
          multiline
          editable={!disabled}
          onKeyPress={onKeyPress}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: tokens.fontSize.md,
            paddingVertical: tokens.spacing.sm,
            maxHeight: 120,
            outlineStyle: "none" as any,
          }}
        />

        {streaming ? (
          <Pressable onPress={onCancel} hitSlop={8} style={styles.iconBtn}>
            <Text style={{ color: colors.danger, fontWeight: "600" }}>Stop</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={send}
            disabled={!value.trim() || disabled}
            hitSlop={8}
            style={[
              styles.sendBtn,
              {
                backgroundColor: value.trim() ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.primaryFg, fontWeight: "600" }}>Send</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    paddingHorizontal: tokens.spacing.sm,
  },
  iconBtn: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    marginVertical: tokens.spacing.xs,
  },
});
