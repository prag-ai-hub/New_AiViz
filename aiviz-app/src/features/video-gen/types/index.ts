export type VideoJobStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled";

export type VideoJob = {
  id: number;
  prompt: string;
  refined_prompt: string;
  model: string;
  status: VideoJobStatus;
  url: string | null;
  seed_image_url: string | null;
  duration_seconds: number | null;
  queue_position: number;
  error: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type GenerateVideoRequest = {
  prompt: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const ACTIVE_VIDEO_STATUSES: VideoJobStatus[] = ["pending", "running"];
export const TERMINAL_VIDEO_STATUSES: VideoJobStatus[] = [
  "succeeded",
  "failed",
  "canceled",
];

export function isActive(status: VideoJobStatus): boolean {
  return status === "pending" || status === "running";
}

export function isTerminal(status: VideoJobStatus): boolean {
  return (
    status === "succeeded" || status === "failed" || status === "canceled"
  );
}
