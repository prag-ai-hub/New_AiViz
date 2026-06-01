import { apiClient } from "@/core/api/client";
import type { LanguagesResponse } from "@/features/code-helper/types";

export async function getLanguages(): Promise<LanguagesResponse> {
  const { data } = await apiClient.get<LanguagesResponse>("/code/languages");
  return data;
}
