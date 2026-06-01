import { apiClient } from "@/core/api/client";
import type {
  GenerateVideoRequest,
  Paginated,
  VideoJob,
} from "@/features/video-gen/types";

export async function generateVideo(
  req: GenerateVideoRequest,
): Promise<VideoJob> {
  const { data } = await apiClient.post<VideoJob>("/video/generate", req, {
    timeout: 30_000,
  });
  return data;
}

export async function getVideoJob(id: number): Promise<VideoJob> {
  const { data } = await apiClient.get<VideoJob>(`/video/jobs/${id}`);
  return data;
}

export async function listVideoJobs(
  page: number = 1,
): Promise<Paginated<VideoJob>> {
  const { data } = await apiClient.get<Paginated<VideoJob>>("/video/jobs", {
    params: { page },
  });
  return data;
}

export async function cancelVideoJob(id: number): Promise<VideoJob> {
  const { data } = await apiClient.post<VideoJob>(`/video/jobs/${id}/cancel`);
  return data;
}
