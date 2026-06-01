export type PlanCode = "free" | "pro" | "family" | "institution";

export type Plan = {
  code: PlanCode;
  name: string;
  price_inr: number | null;
  billing_period: "none" | "monthly" | "yearly";
  features: {
    combined_daily_limit: number | null;
    per_tool_daily_limits: Record<string, number>;
    watermark?: boolean;
    parent_dashboard?: boolean;
    family_seats?: number;
    sales_led?: boolean;
  };
};

export type Subscription = {
  plan_code: PlanCode;
  plan_name: string;
  status: "active" | "past_due" | "cancelled" | "expired";
  started_at: string | null;
  ends_at: string | null;
};

export type Order = {
  razorpay_order_id: string;
  razorpay_payment_link_id: string;
  payment_link_short_url: string;
  amount_inr: number;
  currency: string;
  status: "created" | "attempted" | "paid" | "failed" | "expired";
  plan_code: PlanCode;
  receipt_id: string;
  created_at: string;
};

export type QuotaLimit = {
  used: number;
  limit: number | null;
  remaining: number | null;
};

export type QuotaSnapshot = {
  plan_code: PlanCode;
  limits: Record<string, QuotaLimit>;
};
