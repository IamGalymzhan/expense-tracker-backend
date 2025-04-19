# Expense Tracker API

API для приложения учета расходов и доходов.

## Требования

- Node.js (v14 или выше)
- PostgreSQL (v12 или выше)
- npm или yarn

## Установка

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd expense-tracker-api
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл .env на основе .env.example и настройте переменные окружения:

```bash
cp .env.example .env
```

4. Создайте базу данных PostgreSQL:

```bash
createdb expense_tracker
```

5. Запустите миграции:

```bash
npm run migrate
```

6. Запустите сидеры для заполнения демо-данными:

```bash
npm run seed
```

## Запуск

### Разработка

```bash
npm run dev
```

### Продакшн

```bash
npm start
```

## API Documentation

The API is documented using Swagger UI. You can access the interactive documentation at:

```
http://localhost:5000/api-docs
```

The Swagger UI provides:

- A comprehensive list of all API endpoints
- Request and response schemas
- The ability to test endpoints directly from the browser
- Authentication support via JWT tokens

To use protected endpoints in Swagger UI:

1. First authenticate using the `/api/auth/login` endpoint
2. Copy the token from the response
3. Click the "Authorize" button at the top of the page
4. In the popup, enter your token in the format: `Bearer YOUR_TOKEN_HERE`
5. Click "Authorize" and close the popup
6. Now you can access protected endpoints

## API Endpoints

### Аутентификация

- POST /api/auth/register - регистрация нового пользователя
- POST /api/auth/login - вход в систему
- GET /api/auth/me - получение профиля текущего пользователя

### Уведомления

- GET /api/notifications - получение списка уведомлений пользователя
- POST /api/notifications - создание нового уведомления
- PUT /api/notifications/:notificationId/read - отметить уведомление как прочитанное
- DELETE /api/notifications/:notificationId - удаление уведомления

### Расходы

- GET /api/expenses - получение списка расходов
- POST /api/expenses - создание нового расхода
- GET /api/expenses/:id - получение информации о конкретном расходе
- PUT /api/expenses/:id - обновление расхода
- DELETE /api/expenses/:id - удаление расхода
- GET /api/expenses/categories - получение категорий расходов

### Доходы

- GET /api/incomes - получение списка доходов
- POST /api/incomes - создание нового дохода
- GET /api/incomes/:id - получение информации о конкретном доходе
- PUT /api/incomes/:id - обновление дохода
- DELETE /api/incomes/:id - удаление дохода
- GET /api/incomes/categories - получение категорий доходов

### Статистика

- GET /api/stats/overview - общая статистика
- GET /api/stats/monthly - месячная статистика
- GET /api/stats/category-breakdown - разбивка по категориям

### Задачи

- GET /api/tasks - получение списка задач
- POST /api/tasks - создание новой задачи
- PUT /api/tasks/:id - обновление задачи
- DELETE /api/tasks/:id - удаление задачи

### Достижения

- GET /api/achievements - получение списка достижений
- GET /api/achievements/:id - получение информации о конкретном достижении
- GET /api/achievements/progress - прогресс достижений

### Профиль пользователя

- GET /api/user/profile - получение профиля
- PUT /api/user/profile - обновление профиля
- PUT /api/user/password - изменение пароля

### Бюджет

- GET /api/budgets - получение списка бюджетов
- POST /api/budgets - создание нового бюджета
- PUT /api/budgets/:id - обновление бюджета
- DELETE /api/budgets/:id - удаление бюджета

## Уведомления

- Система автоматически создает ежедневные напоминания для пользователей в 21:00 о необходимости добавить данные о финансах за день
- Уведомления могут быть отключены через настройки пользователя
- Типы уведомлений: INFO, WARNING, REMINDER

## Безопасность

- Все эндпоинты (кроме регистрации и входа) требуют JWT токен
- Токен должен передаваться в заголовке Authorization: Bearer <token>
- Реализовано ограничение частоты запросов (rate limiting)
- Используется helmet для защиты заголовков
- Пароли хешируются с помощью bcrypt

## Лицензия

ISC
