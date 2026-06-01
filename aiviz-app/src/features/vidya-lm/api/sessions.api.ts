import { apiClient } from "@/core/api/client";
import type { SessionDetail, SessionSummary } from "@/features/vidya-lm/types";

export async function listSessions(): Promise<SessionSummary[]> {
  const { data } = await apiClient.get<SessionSummary[]>("/lm/sessions");
  return data;
}

export async function createSession(title?: string): Promise<SessionSummary> {
  const { data } = await apiClient.post<SessionSummary>("/lm/sessions", {
    title: title ?? "",
  });
  return data;
}

export async function getSession(id: number): Promise<SessionDetail> {
  const { data } = await apiClient.get<SessionDetail>(`/lm/sessions/${id}`);
  return data;
}

export async function patchSessionTitle(
  id: number,
  title: string,
): Promise<SessionSummary> {
  const { data } = await apiClient.patch<SessionSummary>(`/lm/sessions/${id}`, {
    title,
  });
  return data;
}

export async function deleteSession(id: number): Promise<void> {
  await apiClient.delete(`/lm/sessions/${id}`);
}
