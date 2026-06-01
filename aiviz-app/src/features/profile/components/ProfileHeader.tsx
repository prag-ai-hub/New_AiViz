import { View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import type { User } from "@/features/auth/types";
import { Text } from "@/shared/components/typography";

function initialsOf(user: User): string {
  const first = user.first_name?.[0] ?? "";
  const last = user.last_name?.[0] ?? "";
  const fromName = `${first}${last}`.trim().toUpperCase();
  if (fromName) return fromName;
  return user.email.slice(0, 1).toUpperCase();
}

export function ProfileHeader({ user }: { user: User }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.md }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.primaryFg, fontWeight: tokens.fontWeight.bold, fontSize: tokens.fontSize.lg }}>
          {initialsOf(user)}
        </Text>
      </View>
      <View style={{ flex: 1, gap: tokens.spacing.xs }}>
        <Text variant="h3">{`${user.first_name} ${user.last_name}`.trim() || user.email}</Text>
        <Text variant="caption" style={{ color: colors.muted }}>
          {user.email} · {user.role}
        </Text>
      </View>
    </View>
  );
}
