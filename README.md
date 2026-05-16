# 🪒 ClipMate — AI-Powered Barber Marketplace

**Готовый к запуску мобильный барбер-маркетплейс с AI.**
Стек: Node.js/TypeScript, GraphQL, PostgreSQL, Redis, React Native (Expo), Next.js

---

## Состав проекта

```
clipmate/
├── backend/                       # GraphQL API
│   ├── prisma/schema.prisma       # 16 таблиц (users, barbers, bookings, subscriptions, AI...)
│   ├── src/
│   │   ├── server.ts              # Apollo Server + Stripe webhook
│   │   ├── config/index.ts        # Тарифы, AI-credits, Stripe, Redis
│   │   ├── stripe/webhook.ts      # Stripe webhook: подписки, платежи
│   │   └── graphql/
│   │       ├── types/index.ts     # 40+ GraphQL-типов
│   │       ├── middleware/auth.ts # JWT-авторизация
│   │       └── resolvers/
│   │           ├── auth.ts        # Регистрация/вход (телефон/email)
│   │           ├── barbers.ts     # Поиск (GPS haversine), фильтры
│   │           ├── bookings.ts    # Бронирование + Redis-блокировка слотов
│   │           └── ai.ts          # AI-чат, подбор стрижки, цены, аналитика
│   ├── Dockerfile
│   └── package.json
│
├── mobile/                        # React Native (Expo)
│   ├── src/
│   │   ├── App.tsx                # Навигация: клиент vs барбер
│   │   ├── theme/index.ts         # Dark luxury тема
│   │   ├── services/api.ts        # Apollo Client + SecureStore
│   │   ├── hooks/useAuth.ts
│   │   └── screens/
│   │       ├── auth/LoginScreen.tsx
│   │       ├── auth/RegisterScreen.tsx
│   │       ├── client/HomeScreen.tsx
│   │       ├── client/BarberDetailScreen.tsx
│   │       ├── client/BookingScreen.tsx
│   │       ├── client/AIChatScreen.tsx
│   │       └── barber/BarberDashboardScreen.tsx
│   ├── app.json
│   └── package.json
│
├── web/                           # Админ-панель (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Дашборд: барберы, заказы, клиенты, AI
│   │   │   └── login/page.tsx    # Вход админа
│   │   └── lib/apollo.ts
│   ├── Dockerfile
│   └── package.json
│
├── scripts/
│   ├── setup.sh                   # One-command dev setup
│   └── deploy.sh                  # Production deploy (Ubuntu + Nginx + SSL)
│
├── docker-compose.yml             # Dev: PostgreSQL + Redis + Backend
├── docker-compose.prod.yml        # Production: все сервисы + админка
├── .env.example                   # Шаблон переменных
├── .gitignore
└── README.md
```

---

## 🚀 Быстрый старт

```bash
# 1. Клонируй и настрой
cd clipmate
cp .env.example .env
# → вставь STRIPE_SECRET_KEY и OPENAI_API_KEY

# 2. Запусти БД
docker-compose up -d postgres redis

# 3. Бэкенд
cd backend && npm install && npx prisma migrate dev && npm run dev
# → http://localhost:4000/graphql

# 4. Мобильное приложение
cd mobile && npm install && npx expo start
# → сканируй QR в Expo Go

# 5. Админ-панель
cd web && npm install && npm run dev
# → http://localhost:3001 (login: admin / admin)
```

---

## 👥 Две роли в приложении

### Клиент
- Регистрируется (телефон/email)
- Ищет барберов по локации, рейтингу, цене
- Бронирует время (one-tap)
- Платит (Stripe)
- Общается с AI-ассистентом (подбор стрижки по фото, советы)
- Видит историю заказов

### Барбер
- Регистрируется + верификация
- Настраивает: услуги, цены, фото работ, график
- Получает заказы → подтверждает / отклоняет
- Видит аналитику (доход, загрузка, рейтинг)
- Premium: AI-советы по ценам, AI-маркетинг

---

## 💳 Монетизация (V2)

| Роль | Тариф | Цена | Что даёт |
|------|-------|------|----------|
| Барбер | Free | $0 | 10 заказов/мес, базовый профиль |
| Барбер | Pro | $29/мес | Безлимит, приоритет, AI-цена, аналитика |
| Барбер | Premium | $99/мес | Топ-позиции, AI-менеджер, комиссия 10% |
| Клиент | Free | $0 | Бронирование, поиск |
| Клиент | Plus | $4.99/мес | AI-подбор стрижки, напоминания, скидки |

---

## 🤖 AI-модули

- 💬 AI-чат (подбор стрижки по фото, советы по уходу)
- 📈 Оптимизация цен
- ⏱️ Анализ загрузки
- 💰 Прогноз дохода
- 📣 Генерация акций
- ✍️ AI-копирайтер

---

## 📊 Финансовая модель

- **Год 1:** $81K выручки
- **Год 3:** $3.4M выручки
- **Breakeven:** месяц 18
- **LTV/CAC:** 48× (барбер Premium)

---

## 🛠 Деплой

```bash
bash scripts/deploy.sh
```
→ Разворачивает на Ubuntu: Docker, PostgreSQL, Redis, Nginx, SSL (Certbot)

---

**Готов к передаче разработчикам или Bolt/Cursor/GPT-Agent.**
