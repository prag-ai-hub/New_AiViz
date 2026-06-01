export type Role = "user" | "assistant" | "system";

export type Message = {
  id: number;
  role: Role;
  content: string;
  model?: string;
  created_at: string;
};

export type SessionSummary = {
  id: number;
  title: string;
  grade_snapshot: number | null;
  board_snapshot: string;
  lang_snapshot: string;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SessionDetail = SessionSummary & {
  system_prompt_version: string;
  messages: Message[];
};
