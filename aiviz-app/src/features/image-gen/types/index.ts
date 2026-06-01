export type StylePreset =
  | "cartoon"
  | "watercolor"
  | "crayon"
  | "sketch"
  | "anime"
  | "photo_real"
  | "isometric"
  | "digital_art"
  | "pixel";

export type StyleItem = { value: StylePreset; label: string };

export type StylesResponse = { items: StyleItem[] };

export type ImageAssetStatus = "pending" | "succeeded" | "failed";

export type ImageAsset = {
  id: number;
  prompt: string;
  style: StylePreset | "";
  model: string;
  width: number;
  height: number;
  status: ImageAssetStatus;
  url: string | null;
  created_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type GenerateRequest = {
  prompt: string;
  style?: StylePreset | "";
  width?: number;
  height?: number;
};
