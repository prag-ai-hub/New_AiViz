import { storage } from "./mmkv";

type Entry<T> = { v: T; e: number | null };

const key = (k: string) => `aiviz.cache.${k}`;

export async function cacheGet<T>(k: string): Promise<T | null> {
  try {
    const raw = await storage.getItem(key(k));
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (entry.e !== null && entry.e < Date.now()) {
      await storage.removeItem(key(k));
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(k: string, value: T, ttlMs?: number): Promise<void> {
  const entry: Entry<T> = { v: value, e: ttlMs ? Date.now() + ttlMs : null };
  await storage.setItem(key(k), JSON.stringify(entry));
}

export async function cacheClear(k?: string): Promise<void> {
  if (k) {
    await storage.removeItem(key(k));
    return;
  }
  const keys = await storage.getAllKeys();
  const ours = keys.filter((x: string) => x.startsWith("aiviz.cache."));
  await Promise.all(ours.map((x: string) => storage.removeItem(x)));
}
