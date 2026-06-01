import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "@/core/storage";
import { ApiError } from "./errors";
import { withSharedRefresh } from "./refresh_lock";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const REFRESH_PATH = "/auth/refresh";

export function attachRequestInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

export function attachResponseInterceptors(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;
      const status = error.response?.status ?? 0;

      const isRetriable =
        status === 401 &&
        original != null &&
        !original._retry &&
        !original.url?.endsWith(REFRESH_PATH);

      if (isRetriable) {
        try {
          // Lazy-imported so this file doesn't pull the auth feature into the core bundle at startup.
          const { refreshTokens } = await import("@/features/auth/services/refresh_tokens.service");
          const next = await withSharedRefresh(refreshTokens);
          original._retry = true;
          original.headers = original.headers ?? {};
          (original.headers as Record<string, string>).Authorization = `Bearer ${next}`;
          return client.request(original);
        } catch {
          const { signOut } = await import("@/features/auth/services/sign_out.service");
          await signOut();
        }
      }

      const body = (error.response?.data as { error?: { code?: string; detail?: unknown } } | undefined)?.error ?? {};
      throw new ApiError({
        status,
        code: body.code ?? "network_error",
        message: error.message,
        requestId: (error.response?.headers?.["x-request-id"] as string) ?? null,
        detail: body.detail ?? null,
      });
    },
  );
}
