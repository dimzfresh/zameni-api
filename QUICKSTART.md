# 🚀 Быстрый старт Zameni API

Современное API для платформы поиска исполнителей и заказов с микросервисной архитектурой и системой очередей.

## 🏗️ Архитектура

Проект построен на принципах:
- **Модульная архитектура** - каждый функциональный блок изолирован
- **Event-driven архитектура** - асинхронная обработка через очереди
- **SOLID принципы** - чистая архитектура и разделение ответственностей
- **Dependency Injection** - использование IoC контейнера NestJS

## 🛠️ Технологический стек

- **NestJS 11** - прогрессивный Node.js фреймворк
- **TypeScript** - типизированный JavaScript
- **PostgreSQL 15+** - реляционная СУБД
- **TypeORM** - ORM с поддержкой TypeScript
- **JWT** - безсостоятельная аутентификация
- **EventEmitter2** - система событий для очередей
- **Swagger** - автоматическая документация API
- **Kafka** - система обмена сообщениями (опционально)

## 🚀 Быстрый запуск

### Вариант 1: С Docker (рекомендуется)

#### 1. Запуск инфраструктуры
```bash
# Запуск базы данных и зависимостей
npm run db:up
```

#### 2. Установка зависимостей
```bash
npm install
```

#### 3. Настройка окружения
```bash
# Копирование конфигурации для разработки
cp env.development .env
```

#### 4. Создание базы данных
```bash
# Создание базы данных development
npm run db:create:dev
```

#### 5. Запуск приложения
```bash
npm run start:dev
```

#### 6. Тестирование API
```bash
npm run test:api
```

### Вариант 2: Локальная PostgreSQL

#### 1. Установка PostgreSQL
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt install postgresql

# Windows
# Скачайте с официального сайта
```

#### 2. Создание базы данных
```sql
CREATE DATABASE zameni_development;
```

#### 3. Настройка .env
```bash
cp env.development .env
# Отредактируйте параметры подключения в .env
```

#### 4. Запуск
```bash
npm install
npm run start:dev
```

## 📖 Документация API

После запуска приложения Swagger документация доступна по адресу:
`http://localhost:3000/api`

Документация включает:
- **Публичные эндпоинты** - для пользователей (аутентификация, профиль)
- **Админские эндпоинты** - для администраторов (управление пользователями, очереди)
- **Внутренние эндпоинты** - для разработчиков (тестирование, мониторинг)

## 🔄 Система очередей

Проект использует собственную систему очередей для асинхронной обработки:

### Архитектура очереди
- **QueueEngineService** - основной движок очереди
- **Процессоры** - специализированные обработчики
- **Enum'ы** - типобезопасные приоритеты и топики

### Типы сообщений
```typescript
enum QueueTopic {
  USER_REGISTRATION = 'user.registration',
  USER_LOGIN = 'user.login',
  USER_REFRESH = 'user.refresh',
  USER_LOGOUT = 'user.logout',
  USER_DELETE = 'user.delete',
  USER_CLEANUP = 'user.cleanup',
  NOTIFICATION_SEND = 'notification.send'
}
```

### Приоритеты
```typescript
enum QueuePriority {
  HIGH = 'high',    // Критичные операции
  NORMAL = 'normal', // Обычные операции
  LOW = 'low'       // Фоновые задачи
}
```

## 🚀 Kafka интеграция

### Запуск Kafka
```bash
# Запуск Kafka для разработки
npm run kafka:up:dev

# Остановка Kafka
npm run kafka:down:dev

# Просмотр логов
npm run kafka:logs:dev
```

### Управление топиками
```bash
# Просмотр всех топиков
npm run kafka:topics:dev

# Создание топика
npm run kafka:create-topic:dev user-events --partitions 3 --replication-factor 1

# Producer (отправка сообщений)
npm run kafka:producer:dev user-events

# Consumer (получение сообщений)
npm run kafka:consumer:dev user-events
```

## 👥 Система ролей

### Роли пользователей
- **USER** - Обычный пользователь (по умолчанию)
  - Может публиковать объявления о поиске исполнителей
  - Может откликаться на объявления других пользователей
  - Универсальная роль для всех участников платформы
- **ADMIN** - Администратор
  - Доступ к веб-админке
  - Модерация контента
  - Управление пользователями

### Статусы пользователей
- **ACTIVE** - Активный (по умолчанию)
- **INACTIVE** - Неактивный
- **BANNED** - Заблокированный

## 🧪 Тестирование API

### Основные эндпоинты для тестирования:

#### 1. Регистрация пользователя (асинхронная)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "name": "Тест", 
    "password": "password123"
  }'
```

#### 2. Вход в систему (асинхронный)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "password123"
  }'
```

#### 3. Проверка статуса операции
```bash
curl -X GET http://localhost:3000/api/auth/status/MESSAGE_ID
```

#### 4. Получение профиля (требует токен)
```bash
curl -X GET http://localhost:3000/api/profile/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Статистика очередей
```bash
curl -X GET http://localhost:3000/api/queue/stats
```

## 🔧 Полезные команды

### Управление базой данных
```bash
# Остановка базы данных
npm run db:down

# Сброс базы данных
npm run db:reset:dev

# Создание администратора
npm run create:admin

# Просмотр конфигурации
npm run config:dev
```

### Разработка
```bash
# Линтинг кода
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование кода
npm run format

# Сборка для продакшена
npm run build
```

### Тестирование
```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:cov

# Тестирование конкурентности
npm run test:concurrency
```

## 🌍 Окружения

Проект поддерживает три окружения:

| Окружение | База данных | Описание |
|-----------|-------------|----------|
| Development | `zameni_development` | Локальная разработка |
| Staging | `zameni_staging` | Тестирование |
| Production | `zameni_production` | Продакшен |

### Управление окружениями
```bash
# Создание баз данных
npm run db:create:dev      # Development
npm run db:create:staging  # Staging
npm run db:create:prod     # Production

# Запуск приложения
npm run start:dev          # Development
npm run start:staging      # Staging
npm run start:prod         # Production

# Просмотр конфигурации
npm run config:dev         # Development
npm run config:staging     # Staging
npm run config:prod        # Production
```

## 🐛 Отладка

### Частые проблемы и решения:

1. **PostgreSQL не запущен**
   ```bash
   # Проверьте статус
   brew services list | grep postgresql
   
   # Запустите если не запущен
   brew services start postgresql
   ```

2. **Порт 3000 занят**
   ```bash
   # Найдите процесс
   lsof -i :3000
   
   # Остановите процесс
   kill -9 PID
   ```

3. **Ошибки подключения к БД**
   - Проверьте параметры в `.env`
   - Убедитесь, что база данных создана
   - Проверьте права доступа пользователя

4. **Ошибки компиляции TypeScript**
   ```bash
   # Очистите кэш
   rm -rf dist
   npm run build
   ```

5. **Проблемы с Kafka**
   ```bash
   # Перезапуск Kafka
   npm run kafka:reset:dev
   
   # Проверка логов
   npm run kafka:logs:dev
   ```

## 📊 Мониторинг

### Health Checks
- Проверка состояния базы данных
- Мониторинг очередей
- Метрики производительности

### Логирование
- Структурированные логи
- Разные уровни логирования
- Ротация логов

## 📝 Следующие шаги

1. **Изучите документацию API** в Swagger UI
2. **Создайте тестовых пользователей** через API
3. **Протестируйте систему очередей** через эндпоинты
4. **Настройте интеграцию** с фронтендом
5. **Изучите архитектуру** в папке `docs/`
6. **Настройте Kafka** для масштабирования

## 📚 Дополнительная документация

Подробная документация по различным аспектам проекта:
- [Архитектура очередей](docs/kafka-architecture.md)
- [Стратегии конкурентности](docs/concurrency-strategies.md)
- [Защита от DDoS](docs/ddos-protection.md)
- [Обработка ошибок](docs/error-handling.md)
- [Мониторинг в продакшене](docs/monitoring-production.md)
- [Управление админами](docs/admin-management.md)
- [Паттерны регистрации](docs/registration-patterns.md)
- [Валидация телефонов](docs/phone-validation.md)
- [Соглашения по именованию](docs/naming-conventions.md)
- [Управление окружениями](docs/environments.md)
