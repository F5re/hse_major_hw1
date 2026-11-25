# Security review

Проверено 25 ноября 2026 года по рекомендациям `security-best-practices` для Next.js, React и browser JavaScript.

## Executive summary

Критических и высоких уязвимостей в реализованном MVP не обнаружено. Секреты остаются на сервере, пользовательский текст отображается через JSX escaping, границы API/AI проверяются Zod, CSP использует request nonce, а письма не сохраняются и не логируются. `npm audit` после обновления dev-инструментов сообщает 0 известных уязвимостей.

## Medium / deployment-dependent

### SEC-001 — Распределённое ограничение частоты

- **Location:** `lib/rate-limit.ts`, `app/api/analyze/route.ts`
- **Evidence:** счётчики хранятся в `Map` процесса и ключуются по IP-заголовку.
- **Impact:** serverless-инстансы и смена IP позволяют обходить лимит дорогого AI.
- **Current mitigation:** отдельные лимиты 30 rules / 5 AI в минуту и optional `AI_ACCESS_TOKEN`.
- **Production fix:** Vercel Firewall/KV rate limit, обязательный demo access code, бюджетный лимит и alert у провайдера.

### SEC-002 — Конфиденциальность у внешнего AI-провайдера

- **Location:** `components/EmailAnalyzer.tsx`, `lib/ai/client.ts`
- **Evidence:** при включении AI полный текст входит в user message внешнего запроса.
- **Impact:** провайдер обрабатывает потенциально конфиденциальный текст.
- **Current mitigation:** AI выключен по умолчанию, UI сообщает о передаче, HTTPS обязателен, timeout/no redirects, no store/log в приложении.
- **Production fix:** выбрать провайдера с подходящими retention/DPA и запретить реальные письма без корпоративного разрешения.

## Low / hardening

### SEC-003 — `style-src 'unsafe-inline'`

- **Location:** `proxy.ts`
- **Evidence:** CSP разрешает inline styles для совместимости с текущим Next.js rendering.
- **Impact:** ослабляет только style-политику; script nonce остаётся строгим.
- **Fix path:** перейти на hash/nonce-compatible style pipeline при появлении rich content или сторонних UI-библиотек.

## Verified controls

- `AI_API_KEY` не имеет `NEXT_PUBLIC_`, читается только модулем с `server-only`.
- `.env*` исключены из Git, `.env.example` не содержит секретов.
- Нет `dangerouslySetInnerHTML`, DOM sinks, `eval`, Web Storage, cookies, uploads, shell или user-controlled outbound URL.
- `POST /api/analyze` ограничивает Content-Length и текст, возвращает `Cache-Control: no-store`.
- AI response проходит schema validation; отсутствующие в исходном тексте цитаты отбрасываются.
- Ошибка AI не удаляет и не понижает признаки правил.
- CSP nonce проверен production E2E; clickjacking/nosniff/referrer/permissions headers заданы централизованно.

Остаточные риски и abuse paths подробнее описаны в [threat model](threat-model.md).
