import { Platform } from "react-native";
import { apiClient } from "@/core/api/client";

export type NativeAudioFile = { uri: string; name: string; type: string };

export async function transcribeAudio(
  file: Blob | NativeAudioFile,
): Promise<{ text: string }> {
  const form = new FormData();
  if (Platform.OS === "web") {
    // Web: Blob → File so FormData sets filename.
    const blob = file as Blob;
    const filename = (blob as unknown as { name?: string }).name ?? "clip.webm";
    form.append("audio", blob, filename);
  } else {
    // RN FormData accepts { uri, name, type } shape directly.
    form.append("audio", file as unknown as Blob);
  }

  const { data } = await apiClient.post<{ text: string }>(
    "/lm/transcribe",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
