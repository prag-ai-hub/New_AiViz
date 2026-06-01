import { apiClient } from "@/core/api";
import type {
  AuthResponse,
  GooglePayload,
  LoginPayload,
  MeResponse,
  SignupPayload,
  Tokens,
} from "@/features/auth/types";

export async function signupApi(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function refreshApi(refresh: string): Promise<Tokens> {
  const { data } = await apiClient.post<Tokens>("/auth/refresh", { refresh });
  return data;
}

export async function meApi(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>("/auth/me");
  return data;
}

export async function googleApi(payload: GooglePayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/google", payload);
  return data;
}
