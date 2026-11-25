import { z } from "zod";

export const MAX_EMAIL_LENGTH = 12_000;

export const analyzeRequestSchema = z.object({
  text: z.string().trim().min(20, "Добавьте больше текста письма — минимум 20 символов.").max(MAX_EMAIL_LENGTH, `Текст длиннее ${MAX_EMAIL_LENGTH.toLocaleString("ru-RU")} символов.`),
  useAI: z.boolean().default(false),
  aiAccessToken: z.string().max(256).optional()
}).strict();

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
