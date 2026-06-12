# AI for PSI Diagnostic Test

Мини-приложение для live-диагностики аудитории на лекции или воркшопе.

## Запуск

```bash
npm install
npm run dev
```

## Supabase

1. Создайте проект Supabase.
2. Выполните SQL из `supabase/schema.sql`.
3. Скопируйте `.env.example` в `.env` и заполните:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_DASHBOARD_RESET_PASSWORD=...
```

Если переменные Supabase не заданы, приложение работает в локальном демо-режиме через `localStorage`.
