import { storage } from "./mmkv";

const key = (k: string) => `aiviz.settings.${k}`;

export async function getSetting<T>(k: string, fallback: T): Promise<T> {
  try {
    const raw = await storage.getItem(key(k));
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setSetting<T>(k: string, value: T): Promise<void> {
  await storage.setItem(key(k), JSON.stringify(value));
}

export async function clearSetting(k: string): Promise<void> {
  await storage.removeItem(key(k));
}
