import axios, { AxiosInstance } from "axios";
import { attachRequestInterceptors, attachResponseInterceptors } from "./interceptors";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

attachRequestInterceptors(apiClient);
attachResponseInterceptors(apiClient);
