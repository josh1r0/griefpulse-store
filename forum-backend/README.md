# ShadowLand — форум жалоб без GitHub для игроков

Жалобы подаются прямо на shadowland.land/complaints.html и хранятся в Cloudflare D1.
GitHub Pages остаётся только хостингом статического сайта.
Для модерации предусмотрена страница shadowland.land/moderation.html.

ВАЖНО: Код API подготовлен, но пока не развёрнут в Cloudflare. До настройки серверной части
форма на сайте честно пишет, что приём жалоб недоступен. Не сообщай ни ChatGPT, ни игрокам
ключ ADMIN_TOKEN или Turnstile secret.

КАК ВКЛЮЧИТЬ ФОРУМ (один раз):
1. Подготовь Cloudflare. Не изменяй DNS магазина и pay.shadowland.land.
2. Создай виджет Turnstile для shadowland.land и получи public sitekey и secret key.
3. В папке forum-backend на компьютере с Node.js:
   npm install
   npx wrangler login
   npx wrangler d1 create shadowland-forum
4. Скопируй database_id из результата в файл wrangler.jsonc.
5. Вставь публичный TURNSTILE_SITEKEY в wrangler.jsonc.
6. Инициализируй базу:
   npx wrangler d1 migrations apply shadowland-forum --remote
7. Установи секреты через CLI, не записывая их в GitHub:
   npx wrangler secret put ADMIN_TOKEN
   npx wrangler secret put TURNSTILE_SECRET
   ADMIN_TOKEN придумай длинный случайный (минимум 24 символа).
8. Разверни:
   npx wrangler deploy
9. Укажи Custom Domain forum-api.shadowland.land для этого Worker в Cloudflare.
   Если домен не в Cloudflare, можно использовать URL workers.dev, но надо
   заменить API в complaints.js и moderation.js на реальный URL Worker.
10. Проверь ответ https://forum-api.shadowland.land/api/config — configured должно быть true.

Игроки: без GitHub, выбирают категорию, ник, тему, описание и ссылки на доказательства,
проходят Turnstile, получают номер и код доступа для проверки статуса.
Только проверенные модерацией заявки появляются в публичном списке.

Администратор: открывает moderation.html, вводит ADMIN_TOKEN,
читает заявки, меняет статус, публикует ответ.
Ключ не сохраняется браузером.

ОГРАНИЧЕНИЯ:
- Привязки к Minecraft-аккаунту нет: ник вводится вручную.
- Максимум три обращения с одного IP за час.
- IP в базе хранится только как хеш с серверным секретом.
- Нет прямой загрузки видео; можно приложить HTTPS-ссылки.
- Нет автоматических Discord-уведомлений.
- Список отображает 100 последних публичных обращений.
- Персональные данные не должны указываться в публичных обращениях.
- Для конфиденциальных обращений Discord: https://discord.gg/9q6bw4eMwe

## Обновление: статус «Одобрена»
Перед обновлением сделайте резервную копию D1. Примените миграцию 0002_approved.sql к существующей базе, затем разверните src/index.js. При ручном развёртывании в Cloudflare добавьте Cron Trigger `* * * * *` (раз в минуту). Не заменяйте существующие секреты, bindings или sitekey шаблонными значениями из wrangler.jsonc. Одобренная жалоба закрывается через 24 часа (cron с точностью до минуты; при чтении API просроченные жалобы также закрываются). Повторное сохранение статуса «Одобрена» не сбрасывает таймер. Публичность по-прежнему определяется галочкой модератора; закрытие сохраняет её и ответ.
