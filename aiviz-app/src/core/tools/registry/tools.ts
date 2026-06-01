export type ToolKey =
  | "vidya_lm"
  | "code_helper"
  | "speech_tutor"
  | "image_gen"
  | "video_gen"
  | "music_gen"
  | "avatar"
  | "skillguru";

export type ToolMeta = {
  key: ToolKey;
  name: string;
  description: string;
  icon: string;
  href: string;
  cost: number;
  price_inr_monthly: number;
  is_popular?: boolean;
};

export const TOOLS: readonly ToolMeta[] = [
  {
    key: "vidya_lm",
    name: "Vidya LM",
    description:
      "Interactive AI tutor for homework help and concept building through guided learning and Socratic questioning.",
    icon: "💬",
    href: "/tools/vidya-lm",
    cost: 1,
    price_inr_monthly: 99,
  },
  {
    key: "image_gen",
    name: "Text-to-Image Generator",
    description:
      "Transform your ideas into stunning visuals using AI image generation capabilities.",
    icon: "🖼️",
    href: "/tools/image-gen",
    cost: 1,
    price_inr_monthly: 99,
  },
  {
    key: "video_gen",
    name: "Text-to-Video Generator",
    description:
      "Create engaging videos from text descriptions using AI video generation technology.",
    icon: "🎬",
    href: "/tools/video-gen",
    cost: 1,
    price_inr_monthly: 199,
    is_popular: true,
  },
  {
    key: "speech_tutor",
    name: "Speech Language Tutor",
    description:
      "Practice speaking and learn new languages with AI-powered voice interaction.",
    icon: "🎤",
    href: "/tools/speech-tutor",
    cost: 1,
    price_inr_monthly: 99,
  },
  {
    key: "code_helper",
    name: "AI Code Helper",
    description:
      "Get intelligent code suggestions and improvements using advanced AI models.",
    icon: "</>",
    href: "/tools/code-helper",
    cost: 1,
    price_inr_monthly: 99,
  },
  {
    key: "music_gen",
    name: "Music Generator",
    description:
      "Create custom music compositions from text descriptions using AI music generation.",
    icon: "🎵",
    href: "/tools/music-gen",
    cost: 1,
    price_inr_monthly: 99,
  },
  {
    key: "avatar",
    name: "Vidya Avatar",
    description:
      "AI-powered voice assistant with a lifelike avatar for interactive conversations.",
    icon: "🧑‍🏫",
    href: "/tools/avatar",
    cost: 1,
    price_inr_monthly: 149,
  },
  {
    key: "skillguru",
    name: "Gap Analyzer Pro",
    description:
      "Analyze learning gaps from answer sheets, get personalized recommendations, and track progress with AI-powered insights.",
    icon: "📊",
    href: "/tools/skillguru",
    cost: 1,
    price_inr_monthly: 199,
  },
] as const;

export const TOOL_BY_KEY: Record<ToolKey, ToolMeta> = Object.fromEntries(
  TOOLS.map((t) => [t.key, t]),
) as Record<ToolKey, ToolMeta>;
