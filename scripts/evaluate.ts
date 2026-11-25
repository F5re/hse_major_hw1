import dataset from "../data/evaluation-emails.json";
import { analyzeByRules } from "../lib/analyzer/analyze";

type Category = "suspicious" | "ambiguous" | "normal";
const rows = dataset as Array<{ id: string; category: Category; text: string }>;
let tp = 0, tn = 0, fp = 0, fn = 0;
const details: string[] = [];

for (const row of rows) {
  const result = analyzeByRules(row.text);
  const predictedPositive = result.riskLevel === "high" || result.riskLevel === "medium";
  if (row.category === "ambiguous") {
    details.push(`${row.id}: ${result.riskLevel} (не включено в бинарные метрики)`);
    continue;
  }
  const actualPositive = row.category === "suspicious";
  if (actualPositive && predictedPositive) tp += 1;
  else if (!actualPositive && !predictedPositive) tn += 1;
  else if (!actualPositive && predictedPositive) fp += 1;
  else fn += 1;
  details.push(`${row.id}: ${result.riskLevel}`);
}

const ratio = (n: number, d: number) => d === 0 ? 0 : n / d;
const precision = ratio(tp, tp + fp);
const recall = ratio(tp, tp + fn);
const f1 = ratio(2 * precision * recall, precision + recall);
console.log(JSON.stringify({ tp, tn, fp, fn, precision, recall, f1, evaluated: tp + tn + fp + fn, ambiguousExcluded: rows.filter((row) => row.category === "ambiguous").length, details }, null, 2));
