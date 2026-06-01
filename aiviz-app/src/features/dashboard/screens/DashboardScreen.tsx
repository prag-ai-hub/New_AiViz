import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { TOOLS } from "@/core/tools/registry";
import { useMe } from "@/features/auth/hooks";
import { useQuotas, useSubscription } from "@/features/billing/hooks";
import {
  QuickLink,
  StatCard,
  SubscriptionRow,
  TodoItem,
} from "@/features/dashboard/components";
import { useTodoList } from "@/features/dashboard/hooks/useTodoList";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

function formatExpiry(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return null;
  }
}

export function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const me = useMe();
  const sub = useSubscription();
  const quotas = useQuotas();
  const todos = useTodoList((s) => s.items);
  const addTodo = useTodoList((s) => s.add);
  const toggleTodo = useTodoList((s) => s.toggle);
  const removeTodo = useTodoList((s) => s.remove);

  const [draft, setDraft] = useState("");

  const firstName =
    me.data?.user.first_name || me.data?.user.email?.split("@")[0] || "there";
  const board = me.data?.profile?.board ?? "EduAI Hub";
  const planExpiry = formatExpiry(sub.data?.ends_at ?? null);
  const planActive = sub.data?.status === "active";

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setDraft("");
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: tokens.spacing.lg,
          paddingBottom: tokens.spacing["2xl"],
        }}
      >
        {/* Welcome banner */}
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text variant="h1" style={{ color: colors.text }}>
            Welcome back, {firstName}!
          </Text>
          <Text variant="body" style={{ color: colors.muted, marginTop: 4 }}>
            School: {board}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="📚" label="Enrolled Courses" value={0} />
          <StatCard
            icon="🤖"
            label="Tools Subscribed"
            value={TOOLS.length}
          />
        </View>

        {/* Two-column row: Subscriptions | To-Do */}
        <View style={styles.twoCol}>
          {/* Active Subscriptions */}
          <View
            style={[
              styles.panel,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.panelHead}>
              <Text style={{ fontSize: 18 }}>📦</Text>
              <Text variant="body" style={{ color: colors.text, fontWeight: "600" }}>
                Active Subscriptions
              </Text>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {TOOLS.map((tool) => {
                const ql = quotas.limitFor(tool.key);
                return (
                  <SubscriptionRow
                    key={tool.key}
                    icon={tool.icon}
                    name={tool.name}
                    active={planActive}
                    expiresAt={planExpiry}
                    used={ql.used}
                    limit={ql.limit}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* To-Do List */}
          <View
            style={[
              styles.panel,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.panelHead}>
              <Text style={{ fontSize: 18 }}>✅</Text>
              <Text variant="body" style={{ color: colors.text, fontWeight: "600" }}>
                To-Do List
              </Text>
            </View>
            <View style={styles.addRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={handleAdd}
                placeholder="Enter new task"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                  },
                ]}
              />
              <Pressable
                onPress={handleAdd}
                style={({ pressed }) => [
                  styles.addBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>Add</Text>
              </Pressable>
            </View>
            {todos.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 28 }}>📋</Text>
                <Text variant="caption" style={{ color: colors.muted }}>
                  No tasks added yet.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 240 }}>
                {todos.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    onToggle={() => toggleTodo(t.id)}
                    onRemove={() => removeTodo(t.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Quick links */}
        <View style={styles.quickRow}>
          <QuickLink
            icon="💳"
            label="Subscriptions"
            caption="Purchase new educational tools"
            onPress={() => router.push("/(tabs)/subscription" as never)}
          />
          <QuickLink
            icon="🎧"
            label="Support"
            caption="Contact support for assistance"
            onPress={() =>
              Linking.openURL("mailto:support@aiviz.app").catch(() => {})
            }
          />
          <QuickLink
            icon="🛡️"
            label="Privacy Policy"
            caption="View our privacy policy"
            onPress={() => Linking.openURL("https://aiviz.app/privacy").catch(() => {})}
          />
          <QuickLink
            icon="🎥"
            label="Watch Video"
            caption="AI tools tutorial"
            onPress={() => Linking.openURL("https://aiviz.app/tour").catch(() => {})}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: tokens.spacing.md,
  },
  twoCol: {
    flexDirection: "row",
    gap: tokens.spacing.md,
    flexWrap: "wrap",
  },
  panel: {
    flex: 1,
    minWidth: 280,
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
  },
  panelHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  addRow: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    fontSize: tokens.fontSize.md,
    outlineStyle: "none" as any,
  },
  addBtn: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: tokens.spacing["2xl"],
    gap: tokens.spacing.xs,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
});
