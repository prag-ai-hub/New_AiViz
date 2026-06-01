import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { tokens } from "@/core/theme";
import {
  OptionCard,
  SubjectChip,
} from "@/features/onboarding/components";
import { BOARDS, GRADES, LANGUAGES, SUBJECTS } from "@/features/onboarding/constants";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks";
import { profileSchema, type ProfileFormValues } from "@/features/profile/validations";
import { Button } from "@/shared/components/buttons";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

export function EditProfileScreen() {
  const { profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      grade: profile?.grade ?? null,
      board: (profile?.board as ProfileFormValues["board"]) ?? null,
      subjects: profile?.subjects ?? [],
      lang: (profile?.lang as ProfileFormValues["lang"]) ?? null,
      learning_style: (profile?.learning_style as ProfileFormValues["learning_style"]) ?? null,
    },
  });

  const onSubmit = handleSubmit((values) => updateProfile.mutate(values));

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: tokens.spacing.xl, paddingBottom: tokens.spacing["3xl"] }}>
        <Text variant="h2">Edit profile</Text>

        <View style={{ gap: tokens.spacing.sm }}>
          <Text variant="h3">Grade</Text>
          <Controller
            control={control}
            name="grade"
            render={({ field }) => (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
                {GRADES.map((n) => (
                  <View key={n} style={{ width: "30%" }}>
                    <OptionCard title={`Grade ${n}`} selected={field.value === n} onPress={() => field.onChange(n)} />
                  </View>
                ))}
              </View>
            )}
          />
        </View>

        <View style={{ gap: tokens.spacing.sm }}>
          <Text variant="h3">Board</Text>
          <Controller
            control={control}
            name="board"
            render={({ field }) => (
              <View style={{ gap: tokens.spacing.sm }}>
                {BOARDS.map((b) => (
                  <OptionCard key={b.value} title={b.label} selected={field.value === b.value} onPress={() => field.onChange(b.value)} />
                ))}
              </View>
            )}
          />
        </View>

        <View style={{ gap: tokens.spacing.sm }}>
          <Text variant="h3">Subjects</Text>
          <Controller
            control={control}
            name="subjects"
            render={({ field }) => (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
                {SUBJECTS.map((s) => {
                  const selected = field.value?.includes(s.value);
                  return (
                    <SubjectChip
                      key={s.value}
                      label={s.label}
                      selected={!!selected}
                      onPress={() =>
                        field.onChange(
                          selected
                            ? (field.value ?? []).filter((v) => v !== s.value)
                            : [...(field.value ?? []), s.value],
                        )
                      }
                    />
                  );
                })}
              </View>
            )}
          />
        </View>

        <View style={{ gap: tokens.spacing.sm }}>
          <Text variant="h3">Language</Text>
          <Controller
            control={control}
            name="lang"
            render={({ field }) => (
              <View style={{ gap: tokens.spacing.sm }}>
                {LANGUAGES.map((l) => (
                  <OptionCard
                    key={l.value}
                    title={l.label}
                    subtitle={l.hint}
                    selected={field.value === l.value}
                    onPress={() => field.onChange(l.value)}
                  />
                ))}
              </View>
            )}
          />
        </View>

        <Button label="Save changes" loading={updateProfile.isPending} onPress={onSubmit} />
      </ScrollView>
    </Screen>
  );
}
