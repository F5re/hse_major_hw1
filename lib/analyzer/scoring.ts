import type { RiskIndicator, RiskLevel } from "./types";

export function calculateRisk(indicators: RiskIndicator[], textLength: number): { score: number; riskLevel: RiskLevel } {
  if (textLength < 50 && indicators.length === 0) return { score: 0, riskLevel: "undetermined" };
  const ids = new Set(indicators.map((item) => item.id));
  let points = indicators.reduce((total, item) => total + item.weight, 0);
  if (ids.has("bank-details") && ids.has("urgency")) points += 4;
  if (ids.has("money-transfer") && ids.has("urgency")) points += 5;
  if (ids.has("money-transfer") && ids.has("no-verification")) points += 5;
  if (ids.has("credentials") && ids.has("suspicious-link")) points += 4;
  const score = Math.min(100, points * 6);
  if (points >= 11 || ids.has("credentials") && indicators.length >= 2) return { score, riskLevel: "high" };
  if (points >= 4) return { score, riskLevel: "medium" };
  return { score, riskLevel: "low" };
}
