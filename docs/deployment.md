# Запуск и публикация

## Локально

Требуется Node.js 20.9+ и npm 10+. В корне:

```bash
npm ci
npm run dev
```

Открыть `http://localhost:3000`. `.npmrc` включает legacy peer resolver из-за бага npm 10 с optional peer-графом актуального Vitest; lock-файл остаётся фиксированным.

## Проверка production-сборки

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm start
```

## Переменные

Скопировать `.env.example` в `.env.local`. Для rules-режима значения можно оставить пустыми. Для AI нужны `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, опционально `AI_TIMEOUT_MS` и `AI_ACCESS_TOKEN`. Никогда не использовать `NEXT_PUBLIC_` для секретов.

## Vercel

1. Импортировать GitHub-репозиторий в Vercel как Next.js.
2. Оставить build command `npm run build`; install command `npm ci`.
3. Добавить серверные env в Project Settings → Environment Variables.
4. Для публичного платного AI задать `AI_ACCESS_TOKEN` и заменить in-memory limiter на Vercel Firewall/KV rate limit.
5. После deploy проверить главную страницу, `POST /api/analyze`, оба размера экрана, rules fallback и заголовки CSP/no-store.
6. Ссылкой преподавателю служит production URL вида `https://<project>.vercel.app` или собственный домен — только после фактической публикации.

При недоступном AI приложение не падает: показывает уведомление и результат правил. Сейчас deployment не выполнен, потому что в окружении нет учётных данных Vercel и GitHub remote.
