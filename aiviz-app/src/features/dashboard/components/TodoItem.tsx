import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { Todo } from "@/features/dashboard/hooks/useTodoList";
import { Text } from "@/shared/components/typography";

type Props = {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
};

export function TodoItem({ todo, onToggle, onRemove }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Pressable onPress={onToggle} style={styles.check}>
        <View
          style={[
            styles.box,
            {
              borderColor: colors.primary,
              backgroundColor: todo.done ? colors.primary : "transparent",
            },
          ]}
        >
          {todo.done ? <Text style={{ color: colors.primaryFg, fontSize: 12 }}>✓</Text> : null}
        </View>
        <Text
          style={{
            color: colors.text,
            textDecorationLine: todo.done ? "line-through" : "none",
            opacity: todo.done ? 0.6 : 1,
            flex: 1,
          }}
        >
          {todo.text}
        </Text>
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={{ color: colors.danger, fontSize: 18 }}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: tokens.spacing.sm,
  },
  check: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
