import { z } from "zod";

const E164 = /^\+[1-9]\d{6,14}$/;

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/\d/, "Must contain a digit"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || E164.test(v), "Use E.164 format (e.g. +919876543210)"),
  first_name: z.string().trim().max(80).optional(),
  last_name: z.string().trim().max(80).optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
