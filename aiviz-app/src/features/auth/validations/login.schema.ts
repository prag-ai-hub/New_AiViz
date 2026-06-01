import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required").trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
