import { apiClient } from "@/core/api/client";
import type {
  GenerateRequest,
  ImageAsset,
  Paginated,
} from "@/features/image-gen/types";

export async function generateImage(req: GenerateRequest): Promise<ImageAsset> {
  const { data } = await apiClient.post<ImageAsset>("/image/generate", req, {
    timeout: 60_000, // image gen takes ~5–15s; bump from default 15s
  });
  return data;
}

export async function listImages(
  page: number = 1,
): Promise<Paginated<ImageAsset>> {
  const { data } = await apiClient.get<Paginated<ImageAsset>>("/image/history", {
    params: { page },
  });
  return data;
}
