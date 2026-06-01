import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { LANGUAGES } from "@/features/onboarding/constants";
import { InfoField } from "@/features/profile/components";
import { useProfile } from "@/features/profile/hooks";
import { useUpdateProfile } from "@/features/profile/hooks";
import { ActionSheet, type ActionSheetItem } from "@/shared/components/modals";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function ProfileScreen() {
  const router = useRouter();
  const { colors, resolved, setMode } = useTheme();
  const { user, profile, isLoading, isError, refetch, isAuthenticated } = useProfile();
  const update = useUpdateProfile();
  const [langSheetOpen, setLangSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: tokens.spacing.md }}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
          <Text variant="h3" style={{ color: colors.text }}>
            {isAuthenticated ? "Couldn't load your profile" : "Please sign in to continue"}
          </Text>
          {isAuthenticated ? (
            <Text variant="caption" style={{ color: colors.muted, textAlign: "center" }}>
              {isError
                ? "We hit an error talking to the server."
                : "Your session may have expired."}
            </Text>
          ) : null}
          <Pressable
            onPress={() =>
              isAuthenticated
                ? refetch()
                : router.replace("/(auth)/login" as never)
            }
            style={({ pressed }) => [
              styles.retry,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
              {isAuthenticated ? "Retry" : "Sign In"}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const username = user.email.split("@")[0];
  const memberSince = format(new Date(user.date_joined), "MMM dd, yyyy");
  const currentLangLabel =
    LANGUAGES.find((l) => l.value === profile?.lang)?.label ?? "Select Language";

  const langItems: ActionSheetItem[] = LANGUAGES.map((l) => ({
    label: l.label,
    onPress: () => update.mutate({ lang: l.value as any }),
  }));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: tokens.spacing.lg,
          paddingBottom: tokens.spacing["2xl"],
        }}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.headRow}>
            <View style={styles.title}>
              <Text style={{ fontSize: 22 }}>👤</Text>
              <Text variant="h1" style={{ color: colors.text }}>
                User Profile
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/profile/edit" as never)}
              style={({ pressed }) => [
                styles.editBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ fontSize: 14 }}>✏️</Text>
              <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
                Edit Profile
              </Text>
            </Pressable>
          </View>

          <View style={{ gap: tokens.spacing.md }}>
            <View style={styles.row}>
              <InfoField label="User ID" value={user.id} />
              <InfoField label="Username" value={username} />
            </View>
            <View style={styles.row}>
              <InfoField label="Email" value={user.email} />
              <InfoField label="Role" value={user.role[0].toUpperCase() + user.role.slice(1)} />
            </View>
            <View style={styles.row}>
              <InfoField
                label="Class"
                value={profile?.grade != null ? `Grade ${profile.grade}` : null}
              />
              <InfoField label="Section" value={null} />
            </View>
            <InfoField label="School" value={profile?.board ?? "EduAI Hub"} />
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/profile/payment-history" as never)}
            style={({ pressed }) => [
              styles.linkBtn,
              { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 14 }}>📄</Text>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Payment History
            </Text>
          </Pressable>

          <InfoField label="Member Since" value={memberSince} />

          <View style={{ gap: tokens.spacing.xs }}>
            <Text variant="caption" style={{ color: colors.muted }}>
              Select Language
            </Text>
            <Pressable
              onPress={() => setLangSheetOpen(true)}
              style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.bg }]}
            >
              <Text style={{ color: colors.text, flex: 1 }}>{currentLangLabel}</Text>
              <Text style={{ color: colors.muted }}>▾</Text>
            </Pressable>
          </View>

          <View style={{ gap: tokens.spacing.xs }}>
            <Text variant="caption" style={{ color: colors.muted }}>
              Theme
            </Text>
            <Pressable
              onPress={() => setMode(resolved === "dark" ? "light" : "dark")}
              style={[
                styles.themeToggle,
                { backgroundColor: colors.bg, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.themeThumb,
                  {
                    backgroundColor: colors.primary,
                    alignSelf: resolved === "dark" ? "flex-start" : "flex-end",
                  },
                ]}
              />
              <Text
                style={{
                  position: "absolute",
                  left: 10,
                  top: 6,
                  fontSize: 14,
                  opacity: resolved === "dark" ? 0 : 1,
                }}
              >
                ☀️
              </Text>
              <Text
                style={{
                  position: "absolute",
                  right: 10,
                  top: 6,
                  fontSize: 14,
                  opacity: resolved === "dark" ? 1 : 0,
                }}
              >
                🌙
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ActionSheet
        visible={langSheetOpen}
        onClose={() => setLangSheetOpen(false)}
        title="Language"
        items={langItems}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
  },
  row: {
    flexDirection: "row",
    gap: tokens.spacing.md,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    alignSelf: "flex-start",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
  },
  themeToggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
    justifyContent: "center",
    position: "relative",
  },
  themeThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  retry: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
});
