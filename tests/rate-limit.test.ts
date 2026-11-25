import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitsForTests } from "@/lib/rate-limit";

describe("ограничение частоты", () => {
  beforeEach(resetRateLimitsForTests);
  it("пропускает запросы до лимита", () => { expect(checkRateLimit("a", 2).allowed).toBe(true); expect(checkRateLimit("a", 2).allowed).toBe(true); });
  it("останавливает превышение лимита", () => { checkRateLimit("a", 1); expect(checkRateLimit("a", 1).allowed).toBe(false); });
});
