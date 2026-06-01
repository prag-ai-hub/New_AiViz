import { getSetting } from "@/core/storage";
import { meApi } from "@/features/auth/api";

/** Decide where a freshly-authed user should land. Called from useSignIn/useSignUp/useGoogleSignIn.
 *  Fetches /me once to check profile.grade, then respects the "I'll do this later" dismiss flag. */
export async function routeAfterAuth(opts: { forceOnboarding?: boolean } = {}): Promise<
  "/(auth)/onboarding/grade" | "/(tabs)/dashboard"
> {
  if (opts.forceOnboarding) return "/(auth)/onboarding/grade";

  const dismissed = await getSetting<boolean>("onboarding_dismissed", false);
  if (dismissed) return "/(tabs)/dashboard";

  try {
    const me = await meApi();
    return me.profile?.grade == null ? "/(auth)/onboarding/grade" : "/(tabs)/dashboard";
  } catch {
    return "/(tabs)/dashboard"; // /me failed; fall through, Splash will gate next time
  }
}
