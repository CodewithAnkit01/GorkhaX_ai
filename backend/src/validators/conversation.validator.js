import { z } from "zod";

export const createConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),

  model: z
    .string()
    .trim()
    .max(100, "Model name cannot exceed 100 characters")
    .optional(),
});

export const updateConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),

  model: z
    .string()
    .trim()
    .max(100, "Model name cannot exceed 100 characters")
    .nullable()
    .optional(),
});