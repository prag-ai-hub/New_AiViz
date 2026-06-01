import { z } from "zod";

export const profileSchema = z.object({
  grade: z
    .number()
    .int()
    .min(1, "Grade must be 1–12")
    .max(12, "Grade must be 1–12")
    .nullable()
    .optional(),
  board: z
    .enum(["cbse", "icse", "maharashtra_state", "other"])
    .nullable()
    .optional(),
  subjects: z.array(z.string()).default([]),
  lang: z.enum(["en", "hi", "mr"]).nullable().optional(),
  learning_style: z.enum(["visual", "auditory", "kinesthetic"]).nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
