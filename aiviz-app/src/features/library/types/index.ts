export type SourceKind =
  | "vidya_lm"
  | "image_gen"
  | "video_gen"
  | "code_helper";

export type Tag = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
};

export type ImageSource = {
  id: number;
  url: string | null;
  prompt: string;
  refined_prompt: string;
  model: string;
  width: number;
  height: number;
};

export type VideoSource = {
  id: number;
  url: string | null;
  seed_image_url: string | null;
  prompt: string;
  refined_prompt: string;
  duration_seconds: number | null;
};

export type CodeSource = {
  id: number;
  action: string;
  language: string;
  code_preview: string;
  response_preview: string;
  model: string;
};

export type ChatSource = {
  id: number;
  message_count: number;
  last_assistant: string;
  grade_snapshot: number | null;
  board_snapshot: string;
  lang_snapshot: string;
};

export type EntrySource =
  | ImageSource
  | VideoSource
  | CodeSource
  | ChatSource
  | null;

export type NotebookEntry = {
  id: number;
  source_kind: SourceKind;
  title: string;
  summary: string;
  tags: Tag[];
  source: EntrySource;
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ContinueTarget =
  | "vidya_lm"
  | "image_gen"
  | "code_helper"
  | "speech_tutor"
  | "music_gen"
  | "video_gen"
  | "avatar"
  | "skillguru";

export type ContinueWithResponse = {
  route: string;
  params: Record<string, string | number>;
};
