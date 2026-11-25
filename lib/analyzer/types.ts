import { z } from "zod";

export const riskLevelSchema = z.enum(["high", "medium", "low", "undetermined"]);
export const analysisModeSchema = z.enum(["rules", "hybrid"]);

export const riskIndicatorSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  evidence: z.string().min(1).max(500),
  explanation: z.string().min(1).max(500),
  recommendation: z.string().min(1).max(500),
  weight: z.number().int().min(1).max(10)
});

export const analysisResultSchema = z.object({
  riskLevel: riskLevelSchema,
  mode: analysisModeSchema,
  score: z.number().int().min(0).max(100),
  indicators: z.array(riskIndicatorSchema).max(20),
  recommendations: z.array(z.string().min(1).max(500)).max(12),
  summary: z.string().min(1).max(800),
  limitations: z.array(z.string().min(1).max(500)).min(1).max(8),
  ai: z.object({ requested: z.boolean(), used: z.boolean(), notice: z.string().max(500).optional() }).optional()
});

export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type AnalysisMode = z.infer<typeof analysisModeSchema>;
export type RiskIndicator = z.infer<typeof riskIndicatorSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
