import { detectIndicators } from "./rules";
import { calculateRisk } from "./scoring";
import type { AnalysisResult, RiskIndicator } from "./types";

const LIMITATIONS = [
  "Проверяется только вставленный текст: адрес отправителя, заголовки, вложения и фактический адрес сайта не анализируются.",
  "Отсутствие известных признаков не доказывает подлинность или безопасность письма."
];

export function analyzeByRules(text: string): AnalysisResult {
  const indicators = detectIndicators(text);
  const { score, riskLevel } = calculateRisk(indicators, text.trim().length);
  const recommendations = [...new Set(indicators.map((item) => item.recommendation))];
  if (recommendations.length === 0) {
    recommendations.push("Проверьте отправителя и контекст обычным рабочим способом перед выполнением значимых действий.");
  }
  const summaries: Record<AnalysisResult["riskLevel"], string> = {
    high: "Обнаружено сочетание сильных признаков социальной инженерии. Не выполняйте инструкции до независимой проверки.",
    medium: "В тексте есть признаки, которые требуют дополнительной проверки по другому каналу.",
    low: "Явных признаков по известным правилам не обнаружено. Это не подтверждает подлинность письма.",
    undetermined: "Текста недостаточно для содержательного вывода. Добавьте тему, обращение и основную часть письма."
  };
  return { riskLevel, mode: "rules", score, indicators, recommendations, summary: summaries[riskLevel], limitations: LIMITATIONS };
}

export function mergeHybridResult(ruleResult: AnalysisResult, aiIndicators: RiskIndicator[], aiSummary?: string): AnalysisResult {
  const validNew = aiIndicators.filter((candidate) => !ruleResult.indicators.some((item) => item.id === candidate.id));
  const indicators = [...ruleResult.indicators, ...validNew];
  const { score, riskLevel: combinedLevel } = calculateRisk(indicators, 100);
  const rank = { undetermined: 0, low: 1, medium: 2, high: 3 } as const;
  const riskLevel = rank[combinedLevel] >= rank[ruleResult.riskLevel] ? combinedLevel : ruleResult.riskLevel;
  return {
    ...ruleResult,
    riskLevel,
    mode: "hybrid",
    score: Math.max(score, ruleResult.score),
    indicators,
    recommendations: [...new Set([...ruleResult.recommendations, ...validNew.map((item) => item.recommendation)])],
    summary: aiSummary || ruleResult.summary,
    ai: { requested: true, used: true }
  };
}
