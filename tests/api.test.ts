import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/analyze/route";
import { resetRateLimitsForTests } from "@/lib/rate-limit";

describe("POST /api/analyze", () => {
  beforeEach(() => { resetRateLimitsForTests(); delete process.env.AI_API_KEY; delete process.env.AI_ACCESS_TOKEN; });

  it("возвращает 400 для некорректного JSON", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
  });

  it("возвращает результат правил без AI", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "Срочно переведите деньги на новый счёт до конца дня.", useAI: false }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.mode).toBe("rules");
    expect(body.riskLevel).toBe("high");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("без AI-конфигурации возвращает честный fallback", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "Перейдите на https://login.example.com и срочно войдите в аккаунт.", useAI: true }) }));
    const body = await response.json();
    expect(body.mode).toBe("rules");
    expect(body.ai).toMatchObject({ requested: true, used: false });
    expect(body.ai.notice).toContain("Результат получен по локальным правилам");
  });
});
