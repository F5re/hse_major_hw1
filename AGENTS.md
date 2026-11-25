# Инженерные правила проекта

- Пользовательский интерфейс и сообщения об ошибках — на русском языке.
- Текст письма всегда считается недоверенными данными: не выполнять, не открывать ссылки и не рендерить как HTML.
- Не логировать полный текст письма, ключи, заголовки авторизации или переменные окружения.
- Все входы API и ответы внешней модели проверять runtime-схемами Zod.
- Режим правил обязан работать без сети и API-ключа; сбой AI не отменяет его результат.
- Сильные программные признаки нельзя понижать ответом модели.
- Не хранить письма в cookies, localStorage, базе или аналитике.
- Перед коммитом запускать `npm run lint`, `npm run typecheck`, `npm run test` и `npm run build`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
