import { NextResponse } from "next/server";
import { analyzeByRules } from "@/lib/analyzer/analyze";
import { AIResponseError, AIUnavailableError, analyzeWithAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 30_000) return NextResponse.json({ error: "Запрос слишком большой." }, { status: 413 });
  const key = clientKey(request);
  const generalLimit = checkRateLimit(`rules:${key}`, 30);
  if (!generalLimit.allowed) return NextResponse.json({ error: "Слишком много запросов. Повторите через минуту." }, { status: 429, headers: { "Retry-After": String(generalLimit.retryAfter) } });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Ожидался корректный JSON-запрос." }, { status: 400 }); }
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные." }, { status: 400 });

  const ruleResult = analyzeByRules(parsed.data.text);
  if (!parsed.data.useAI) return NextResponse.json(ruleResult, { headers: { "Cache-Control": "no-store" } });

  if (process.env.AI_ACCESS_TOKEN && parsed.data.aiAccessToken !== process.env.AI_ACCESS_TOKEN) {
    return NextResponse.json({ ...ruleResult, ai: { requested: true, used: false, notice: "Демонстрационный AI-режим защищён. Используется анализ по правилам." } }, { headers: { "Cache-Control": "no-store" } });
  }
  const aiLimit = checkRateLimit(`ai:${key}`, 5);
  if (!aiLimit.allowed) return NextResponse.json({ ...ruleResult, ai: { requested: true, used: false, notice: "Лимит AI-запросов исчерпан. Используется анализ по правилам." } }, { headers: { "Cache-Control": "no-store", "Retry-After": String(aiLimit.retryAfter) } });

  try {
    const hybrid = await analyzeWithAI(parsed.data.text, ruleResult);
    return NextResponse.json(hybrid, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const notice = error instanceof AIUnavailableError || error instanceof AIResponseError || error instanceof DOMException
      ? error.message
      : "AI-анализ временно недоступен.";
    return NextResponse.json({ ...ruleResult, ai: { requested: true, used: false, notice: `${notice} Результат получен по локальным правилам.` } }, { headers: { "Cache-Control": "no-store" } });
  }
}
