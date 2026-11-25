"use client";

import { useRef, useState } from "react";
import { demoExamples } from "@/data/demo-examples";
import { analysisResultSchema, type AnalysisResult } from "@/lib/analyzer/types";
import { MAX_EMAIL_LENGTH } from "@/lib/validation";
import styles from "./EmailAnalyzer.module.css";

const riskCopy = {
  high: { label: "Высокая подозрительность", tone: "high" },
  medium: { label: "Умеренная подозрительность", tone: "medium" },
  low: { label: "Явных признаков не обнаружено", tone: "low" },
  undetermined: { label: "Недостаточно данных для вывода", tone: "unknown" }
} as const;

export function EmailAnalyzer() {
  const [text, setText] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [aiAccessToken, setAiAccessToken] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function analyze(candidate = text) {
    const clean = candidate.trim();
    setError("");
    if (clean.length < 20) {
      setError("Добавьте больше текста письма — минимум 20 символов.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    if (candidate.length > MAX_EMAIL_LENGTH) {
      setError(`Сократите письмо до ${new Intl.NumberFormat("ru-RU").format(MAX_EMAIL_LENGTH)} символов.`);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: candidate, useAI, aiAccessToken: aiAccessToken || undefined }) });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Не удалось выполнить проверку.");
      const parsed = analysisResultSchema.safeParse(body);
      if (!parsed.success) throw new Error("Сервер вернул неполный результат. Повторите проверку.");
      setResult(parsed.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось связаться с сервером. Повторите попытку.");
    } finally { setLoading(false); }
  }

  function chooseExample(exampleText: string) {
    setText(exampleText);
    setResult(null);
    void analyze(exampleText);
  }

  function clear() {
    setText(""); setResult(null); setError(""); inputRef.current?.focus();
  }

  const tooLong = text.length > MAX_EMAIL_LENGTH;
  return (
    <div className={styles.workspace}>
      <section className={styles.inputPane} aria-labelledby="input-title">
        <div className={styles.sectionHeading}><h2 id="input-title">Текст письма</h2><span className={tooLong ? styles.counterError : styles.counter}>{new Intl.NumberFormat("ru-RU").format(text.length)} / {new Intl.NumberFormat("ru-RU").format(MAX_EMAIL_LENGTH)}</span></div>
        <label className="sr-only" htmlFor="email-text">Вставьте текст письма</label>
        <textarea ref={inputRef} id="email-text" name="emailText" autoComplete="off" value={text} onChange={(event) => { setText(event.target.value); setError(""); }} className={styles.textarea} placeholder="Вставьте тему, обращение и основную часть письма…" aria-describedby="input-help input-error" aria-invalid={Boolean(error || tooLong)} />
        <p id="input-help" className={styles.help}>Текст не сохраняется. Ссылки не открываются, вложения не обрабатываются.</p>
        <fieldset className={styles.mode}>
          <legend>Режим анализа</legend>
          <label><input type="checkbox" checked={useAI} onChange={(event) => setUseAI(event.target.checked)} /> <span><strong>Добавить анализ языковой моделью</strong><small>{useAI ? "Включено: текст будет передан настроенному внешнему AI-провайдеру. При ошибке сработают правила." : "Необязательно. Без него письмо проверяется только локальными правилами."}</small></span></label>
          {useAI && <label className={styles.accessField} htmlFor="ai-access-token"><span>Код демонстрационного доступа <small>Оставьте пустым, если владелец стенда не выдавал код.</small></span><input id="ai-access-token" name="aiAccessToken" type="password" autoComplete="off" value={aiAccessToken} onChange={(event) => setAiAccessToken(event.target.value)} /></label>}
        </fieldset>
        <div className={styles.actions}><button type="button" className={styles.primary} onClick={() => void analyze()} disabled={loading}>{loading ? "Проверяем…" : result ? "Проверить ещё раз" : "Проверить письмо"}</button><button type="button" className={styles.secondary} onClick={clear} disabled={loading || (!text && !result)}>Очистить</button></div>
        <p id="input-error" ref={errorRef} tabIndex={-1} className={styles.error} aria-live="polite">{error}</p>
        <div className={styles.examples}><h3>Учебные примеры</h3><p>Выберите пример — проверка начнётся сразу.</p><div className={styles.exampleList}>{demoExamples.map((example) => <button key={example.id} type="button" onClick={() => chooseExample(example.text)} disabled={loading}><span>{example.title}</span><small>{example.hint}</small></button>)}</div></div>
      </section>
      <section className={styles.resultPane} aria-labelledby="result-title" aria-busy={loading} aria-live="polite">
        <h2 id="result-title">Результат анализа</h2>
        {loading ? <LoadingState /> : result ? <ResultView result={result} /> : <EmptyState />}
      </section>
    </div>
  );
}

function EmptyState() { return <div className={styles.empty}><span className={styles.emptyMark} aria-hidden="true">?</span><h3>Здесь появится разбор</h3><p>Мы покажем уровень подозрительности, точные фрагменты письма и безопасные следующие действия.</p></div>; }
function LoadingState() { return <div className={styles.empty}><span className={styles.spinner} aria-hidden="true" /><h3>Проверяем текст…</h3><p>Ищем сочетания признаков и готовим объяснения.</p></div>; }

function ResultView({ result }: { result: AnalysisResult }) {
  const risk = riskCopy[result.riskLevel];
  return <div className={`${styles.result} ${styles[risk.tone]}`}>
    <div className={styles.status}><span>Вывод</span><h3>{risk.label}</h3><p>{result.summary}</p><div className={styles.scoreLine}><span>Эвристическая оценка, не статистическая вероятность</span><strong>{result.score} / 100</strong><progress max="100" value={result.score} aria-label={`Эвристическая оценка ${result.score} из 100`} /></div></div>
    <p className={styles.modeBadge}>{result.mode === "hybrid" ? "Правила + языковая модель" : "Анализ по правилам"}</p>
    {result.ai?.notice && <p className={styles.notice}>{result.ai.notice}</p>}
    <section className={styles.findings} aria-labelledby="findings-title"><h3 id="findings-title">Что вызвало подозрение</h3>{result.indicators.length ? <ol>{result.indicators.map((indicator) => <li key={indicator.id}><h4>{indicator.title}</h4><blockquote>{indicator.evidence}</blockquote><p>{indicator.explanation}</p><p className={styles.indicatorAction}><strong>Что делать:</strong> {indicator.recommendation}</p></li>)}</ol> : <p className={styles.noFindings}>Правила не нашли известных формулировок риска. Всё равно сверьте отправителя, если письмо связано с деньгами или доступом.</p>}</section>
    <section className={styles.nextSteps} aria-labelledby="steps-title"><h3 id="steps-title">Следующие действия</h3><ul>{result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <details className={styles.limitations}><summary>Ограничения проверки</summary><ul>{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></details>
  </div>;
}
