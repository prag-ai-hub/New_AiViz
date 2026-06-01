import { apiClient } from "@/core/api";
import type {
  Order,
  Plan,
  PlanCode,
  QuotaSnapshot,
  Subscription,
} from "@/features/billing/types";

export async function listPlansApi(): Promise<Plan[]> {
  const { data } = await apiClient.get<Plan[]>("/billing/plans");
  return data;
}

export async function getSubscriptionApi(): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>("/billing/subscription");
  return data;
}

export async function getQuotaApi(): Promise<QuotaSnapshot> {
  const { data } = await apiClient.get<QuotaSnapshot>("/billing/quota");
  return data;
}

export async function createOrderApi(planCode: PlanCode): Promise<Order> {
  const { data } = await apiClient.post<Order>("/billing/orders", { plan_code: planCode });
  return data;
}
