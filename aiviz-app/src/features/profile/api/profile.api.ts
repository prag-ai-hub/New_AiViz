// Re-export of the onboarding API for symmetry with the feature layout.
// Both onboarding submit and profile edit hit the same PATCH /auth/me/profile endpoint.
export { updateProfileApi } from "@/features/onboarding/api";
