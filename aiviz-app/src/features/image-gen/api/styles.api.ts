import { apiClient } from "@/core/api/client";
import type { StylesResponse } from "@/features/image-gen/types";

export async function getStyles(): Promise<StylesResponse> {
  const { data } = await apiClient.get<StylesResponse>("/image/styles");
  return data;
}
