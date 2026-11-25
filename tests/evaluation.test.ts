import { describe, expect, it } from "vitest";
import dataset from "@/data/evaluation-emails.json";
import { analyzeByRules } from "@/lib/analyzer/analyze";

describe("оценочный набор", () => {
  it("содержит 30 синтетических писем нужных категорий", () => { expect(dataset).toHaveLength(30); expect(dataset.filter((x) => x.category === "suspicious")).toHaveLength(12); expect(dataset.filter((x) => x.category === "ambiguous")).toHaveLength(8); expect(dataset.filter((x) => x.category === "normal")).toHaveLength(10); });
  it("каждое письмо имеет id, текст и пояснение", () => { for (const item of dataset) { expect(item.id).toMatch(/^(sus|amb|norm)-\d{2}$/u); expect(item.text.length).toBeGreaterThan(20); expect(item.rationale.length).toBeGreaterThan(10); } });
  it("набор действительно анализируется", () => expect(dataset.map((item) => analyzeByRules(item.text))).toHaveLength(30));
});
