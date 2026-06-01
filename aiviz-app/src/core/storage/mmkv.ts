import AsyncStorage from "@react-native-async-storage/async-storage";

/** Day 1: AsyncStorage backend (works in Expo Go).
 *  Swap to MMKV when we move to a dev build — same KV semantics. */
export const storage = AsyncStorage;
