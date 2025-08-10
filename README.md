# Zameni API

Современное API для платформы поиска исполнителей и заказов, построенное на NestJS с использованием микросервисной архитектуры и системы очередей.

## 🏗️ Архитектура проекта

### Основные принципы
- **Модульная архитектура** - каждый функциональный блок изолирован в отдельном модуле
- **Слоистая архитектура** - четкое разделение на контроллеры, сервисы и репозитории
- **Event-driven архитектура** - асинхронная обработка через систему очередей
- **Dependency Injection** - использование IoC контейнера NestJS
- **SOLID принципы** - следование принципам чистого кода

### Технологический стек

#### Backend Framework
- **NestJS 11** - прогрессивный Node.js фреймворк для создания эффективных и масштабируемых серверных приложений
- **TypeScript** - типизированный JavaScript для повышения надежности кода

#### База данных
- **PostgreSQL 15+** - мощная реляционная СУБД
- **TypeORM** - ORM с поддержкой TypeScript и автоматическими миграциями

#### Аутентификация и безопасность
- **JWT (JSON Web Tokens)** - безсостоятельная аутентификация
- **bcryptjs** - безопасное хеширование паролей
- **class-validator** - валидация входных данных
- **Helmet** - защита от уязвимостей

#### Система очередей
- **EventEmitter2** - внутренняя система событий
- **Кастомная очередь** - собственная реализация для асинхронной обработки
- **Процессоры** - специализированные обработчики для разных типов задач

#### Документация и мониторинг
- **Swagger/OpenAPI** - автоматическая генерация API документации
- **NestJS Logger** - структурированное логирование
- **Health Checks** - мониторинг состояния приложения

#### Разработка и тестирование
- **Jest** - фреймворк для тестирования
- **ESLint** - статический анализ кода
- **Prettier** - форматирование кода
- **Docker** - контейнеризация

## 📁 Структура проекта

```
src/
├── modules/                    # Основные модули приложения
│   ├── auth/                  # Модуль аутентификации
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Guards для защиты маршрутов
│   │   ├── strategies/       # JWT стратегии
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── queue/                # Система очередей
│   │   ├── interfaces/       # Интерфейсы очереди
│   │   ├── enums/           # Enum'ы для типизации
│   │   ├── processors/      # Обработчики сообщений
│   │   ├── queue-engine.service.ts
│   │   ├── queue.service.ts
│   │   └── queue.module.ts
│   ├── profile/             # Модуль профилей пользователей
│   ├── admin/               # Административная панель
│   ├── cron/                # Планировщик задач
│   └── monitoring/          # Мониторинг и метрики
├── entities/                # Сущности базы данных
│   └── user.entity.ts
├── common/                  # Общие компоненты
│   ├── constants/          # Константы приложения
│   ├── dto/               # Общие DTO
│   ├── filters/           # Фильтры исключений
│   ├── interceptors/      # Перехватчики
│   ├── services/          # Общие сервисы
│   ├── utils/             # Утилиты
│   └── validators/        # Кастомные валидаторы
├── config/                 # Конфигурация
│   ├── environments/      # Конфигурации для разных окружений
│   └── configuration.ts
└── main.ts                # Точка входа приложения
```

## 🔄 Система очередей

### Архитектура очереди
Система построена на принципах Event-Driven Architecture с использованием:

- **QueueEngineService** - основной движок очереди
- **Процессоры** - специализированные обработчики для разных типов задач
- **Enum'ы** - типобезопасные приоритеты и топики
- **Интерфейсы** - четкие контракты между компонентами

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

enum QueuePriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}
```

### Обработчики
- **UserRegistrationProcessor** - обработка регистрации пользователей
- **UserAuthProcessor** - обработка аутентификации
- **NotificationProcessor** - отправка уведомлений

## 🔐 Система безопасности

### Аутентификация
- JWT токены с разделением на access и refresh
- Автоматическое обновление токенов
- Защита от перебора паролей

### Авторизация
- Ролевая модель (USER, ADMIN)
- Guards для защиты маршрутов
- Middleware для валидации токенов

### Валидация данных
- Class-validator для входных данных
- Кастомные валидаторы для специфичных полей
- Автоматическая санитизация

## 🌍 Окружения

Проект поддерживает три окружения:

| Окружение | База данных | Описание |
|-----------|-------------|----------|
| Development | `zameni_development` | Локальная разработка |
| Staging | `zameni_staging` | Тестирование |
| Production | `zameni_production` | Продакшен |

### Конфигурация
- Отдельные файлы конфигурации для каждого окружения
- Переменные окружения через ConfigService
- Автоматическая загрузка конфигурации

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Настройка базы данных
```bash
# Создание базы данных
npm run db:create:dev

# Применение миграций
npm run db:migrate:dev
```

### Запуск приложения
```bash
# Режим разработки
npm run start:dev

# Продакшен
npm run build
npm run start:prod
```

### Документация API
После запуска Swagger документация доступна по адресу:
`http://localhost:3000/api`

Документация включает:
- **Публичные эндпоинты** - для пользователей (аутентификация, профиль)
- **Админские эндпоинты** - для администраторов (управление пользователями, очереди)
- **Внутренние эндпоинты** - для разработчиков (тестирование, мониторинг)

## 🧪 Тестирование

### Запуск тестов
```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:cov
```

## 🗄️ Управление базой данных

### Быстрый доступ
```bash
# Просмотр таблиц
./scripts/db-view-tables.sh

# Просмотр данных в таблице
./scripts/db-view-data.sh users

# Создание дампа
./scripts/db-dump.sh backup.sql
```

### Подключение к БД
- **Хост**: localhost:5432
- **База**: zameni_db
- **Пользователь**: postgres
- **Пароль**: password

### Установка инструментов
```bash
# PostgreSQL client
brew install postgresql

# Docker (альтернатива)
brew install docker
```

📖 Подробная документация: [docs/database-management.md](docs/database-management.md)

### Линтинг и форматирование
```bash
# Проверка кода
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование
npm run format
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

## 🔧 Разработка

### Скрипты
```bash
npm run start:dev          # Запуск в режиме разработки
npm run build              # Сборка проекта
npm run start:prod         # Запуск в продакшене
npm run test               # Запуск тестов
npm run lint               # Проверка кода
npm run create:admin       # Создание администратора
```

### Docker
```bash
# Development
docker-compose -f docker-compose.development.yml up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d
```

## 🚀 Kafka интеграция

### Управление Kafka
```bash
# Запуск Kafka для разработки
npm run kafka:up:dev

# Остановка Kafka
npm run kafka:down:dev

# Просмотр логов
npm run kafka:logs:dev

# Управление топиками
npm run kafka:topics:dev
```

### Создание топиков
```bash
# Создание топика для пользователей
npm run kafka:create-topic:dev user-events --partitions 3 --replication-factor 1

# Создание топика для уведомлений
npm run kafka:create-topic:dev notifications --partitions 2 --replication-factor 1
```

## 📚 Дополнительная документация

Подробная документация по различным аспектам проекта находится в папке `docs/`:

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

## 📄 Лицензия

MIT License