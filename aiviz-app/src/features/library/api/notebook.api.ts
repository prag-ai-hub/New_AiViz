import { apiClient } from "@/core/api/client";
import type {
  ContinueTarget,
  ContinueWithResponse,
  NotebookEntry,
  Paginated,
  Tag,
} from "@/features/library/types";

type ListParams = {
  page?: number;
  tool?: string;
  tag?: string;
  q?: string;
};

export async function listEntries(
  params: ListParams = {},
): Promise<Paginated<NotebookEntry>> {
  const { data } = await apiClient.get<Paginated<NotebookEntry>>(
    "/notebook/entries",
    { params },
  );
  return data;
}

export async function getEntry(id: number): Promise<NotebookEntry> {
  const { data } = await apiClient.get<NotebookEntry>(
    `/notebook/entries/${id}`,
  );
  return data;
}

export async function deleteEntry(id: number): Promise<void> {
  await apiClient.delete(`/notebook/entries/${id}`);
}

export async function setEntryTags(id: number, names: string[]): Promise<Tag[]> {
  const { data } = await apiClient.put<Tag[]>(
    `/notebook/entries/${id}/tags`,
    { names },
  );
  return data;
}

export async function listTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<Tag[]>("/notebook/tags");
  return data;
}

export async function continueWith(
  id: number,
  target: ContinueTarget,
): Promise<ContinueWithResponse> {
  const { data } = await apiClient.post<ContinueWithResponse>(
    `/notebook/entries/${id}/continue-with`,
    { target },
  );
  return data;
}
