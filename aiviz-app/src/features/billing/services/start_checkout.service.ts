import * as WebBrowser from "expo-web-browser";
import { createOrderApi } from "@/features/billing/api";
import type { PlanCode } from "@/features/billing/types";

/** Creates a Razorpay order, opens the hosted payment link in an in-app browser.
 *  Resolves once the user dismisses the browser (regardless of payment outcome).
 *  Webhook is the source of truth for "did the payment succeed". */
export async function startCheckout(planCode: PlanCode): Promise<void> {
  const order = await createOrderApi(planCode);
  if (!order.payment_link_short_url) {
    throw new Error("Razorpay returned no payment link.");
  }
  await WebBrowser.openBrowserAsync(order.payment_link_short_url);
}
