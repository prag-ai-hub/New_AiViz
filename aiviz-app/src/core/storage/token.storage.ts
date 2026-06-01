import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS = "aiviz.access_token";
const REFRESH = "aiviz.refresh_token";

const isWeb = Platform.OS === "web";

const webGet = (k: string): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem(k) : null;
const webSet = (k: string, v: string): void => {
  if (typeof window !== "undefined") window.localStorage.setItem(k, v);
};
const webDel = (k: string): void => {
  if (typeof window !== "undefined") window.localStorage.removeItem(k);
};

export const getAccessToken = async (): Promise<string | null> =>
  isWeb ? webGet(ACCESS) : SecureStore.getItemAsync(ACCESS);

export const getRefreshToken = async (): Promise<string | null> =>
  isWeb ? webGet(REFRESH) : SecureStore.getItemAsync(REFRESH);

export async function setTokens(access: string, refresh: string): Promise<void> {
  if (isWeb) {
    webSet(ACCESS, access);
    webSet(REFRESH, refresh);
    return;
  }
  await SecureStore.setItemAsync(ACCESS, access);
  await SecureStore.setItemAsync(REFRESH, refresh);
}

export async function clearTokens(): Promise<void> {
  if (isWeb) {
    webDel(ACCESS);
    webDel(REFRESH);
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}
