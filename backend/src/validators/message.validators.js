import { z } from "zod";

export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(20000, "Message cannot exceed 20,000 characters"),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(20000, "Message cannot exceed 20,000 characters"),
});