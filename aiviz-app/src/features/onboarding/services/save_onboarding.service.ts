import { setSetting } from "@/core/storage";
import { updateProfileApi } from "@/features/onboarding/api";
import { useOnboardingStore } from "@/features/onboarding/state";
import type { ProfilePatchPayload } from "@/features/onboarding/types";

/** Strips nulls + empty subjects, PATCHes /auth/me/profile, clears the dismissed flag. */
export async function saveOnboarding(): Promise<void> {
  const draft = useOnboardingStore.getState();
  const patch: ProfilePatchPayload = {};
  if (draft.grade !== null) patch.grade = draft.grade;
  if (draft.board !== null) patch.board = draft.board;
  if (draft.subjects.length > 0) patch.subjects = draft.subjects;
  if (draft.lang !== null) patch.lang = draft.lang;
  if (draft.learning_style !== null) patch.learning_style = draft.learning_style;

  if (Object.keys(patch).length > 0) await updateProfileApi(patch);

  await setSetting("onboarding_dismissed", false);
  useOnboardingStore.getState().reset();
}
