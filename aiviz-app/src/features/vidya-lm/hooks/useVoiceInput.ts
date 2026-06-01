import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";
import { showToast } from "@/core/providers";
import { transcribeAudio } from "@/features/vidya-lm/api";

type State = "idle" | "recording" | "transcribing" | "error";

export function useVoiceInput() {
  const [state, setState] = useState<State>("idle");
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        showToast.error({ title: "Mic permission needed" });
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setState("recording");
    } catch {
      setState("error");
      showToast.error({ title: "Couldn't start recording" });
    }
  }, []);

  const stop = useCallback(async (): Promise<string | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;
    recordingRef.current = null;
    setState("transcribing");
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        setState("idle");
        return null;
      }

      let payload: Parameters<typeof transcribeAudio>[0];
      if (Platform.OS === "web") {
        const res = await fetch(uri);
        const blob = await res.blob();
        payload = blob;
      } else {
        payload = {
          uri,
          name: uri.split("/").pop() ?? "clip.m4a",
          type: "audio/m4a",
        };
      }

      const { text } = await transcribeAudio(payload);
      setState("idle");
      return text;
    } catch {
      setState("error");
      showToast.error({ title: "Transcription failed" });
      return null;
    }
  }, []);

  const cancel = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    setState("idle");
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {
        /* ignore */
      }
    }
  }, []);

  return {
    state,
    isRecording: state === "recording",
    isTranscribing: state === "transcribing",
    start,
    stop,
    cancel,
  };
}
