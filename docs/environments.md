# Управление окружениями (Environments)

## Обзор

Наш API поддерживает три окружения:
- **Development** - для разработки
- **Staging** - для тестирования
- **Production** - для продакшена

## Базы данных

Каждое окружение имеет свою отдельную базу данных:

| Окружение | База данных | Порт | Описание |
|-----------|-------------|------|----------|
| Development | `zameni_development` | 5432 | Локальная разработка |
| Staging | `zameni_staging` | 5433 | Тестирование |
| Production | `zameni_production` | 5432 | Продакшен |

## Управление базами данных

### Создание баз данных

```bash
# Создать базу для development
npm run db:create:dev

# Создать базу для staging
npm run db:create:staging

# Создать базу для production
npm run db:create:prod
```

### Удаление баз данных

```bash
# Удалить базу development
npm run db:drop:dev

# Удалить базу staging
npm run db:drop:staging

# Удалить базу production
npm run db:drop:prod
```

### Сброс баз данных

```bash
# Сбросить базу development
npm run db:reset:dev

# Сбросить базу staging
npm run db:reset:staging

# Сбросить базу production
npm run db:reset:prod
```

### Просмотр существующих баз

```bash
npm run db:list
```

## Запуск приложения

### Development

```bash
# Обычный запуск
npm run start:dev

# С переменными окружения
npm run start:dev:env
```

### Staging

```bash
# Сборка для staging
npm run build:staging

# Запуск staging
npm run start:staging

# С переменными окружения
npm run start:staging:env
```

### Production

```bash
# Сборка для production
npm run build:prod

# Запуск production
npm run start:prod

# С переменными окружения
npm run start:prod:env
```

## Docker Compose

### Development

```bash
# Запуск сервисов development
docker-compose -f docker-compose.development.yml up -d

# Остановка
docker-compose -f docker-compose.development.yml down

# Сброс
docker-compose -f docker-compose.development.yml down -v
```

### Staging

```bash
# Запуск сервисов staging
docker-compose -f docker-compose.staging.yml up -d

# Остановка
docker-compose -f docker-compose.staging.yml down
```

## Конфигурация

### Development

- **База данных**: Автоматическая синхронизация схемы
- **Логирование**: Подробные логи (debug)
- **Swagger**: Включен
- **CORS**: Локальные домены
- **Rate Limiting**: 1000 запросов/15 мин

### Staging

- **База данных**: Отключена автоматическая синхронизация
- **Логирование**: Информационные логи (info)
- **Swagger**: Включен
- **CORS**: Staging домены
- **Rate Limiting**: 500 запросов/15 мин

### Production

- **База данных**: Отключена автоматическая синхронизация
- **Логирование**: Только предупреждения (warn)
- **Swagger**: Отключен
- **CORS**: Production домены
- **Rate Limiting**: 100 запросов/15 мин
- **SSL**: Включен
- **Безопасность**: Усиленная

## Переменные окружения

### Development (.env.development)

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=zameni_development
JWT_SECRET=dev-secret-key-change-in-production
LOG_LEVEL=debug
```

### Staging (.env.staging)

```env
NODE_ENV=staging
DB_HOST=staging-db.example.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=staging-password
DB_NAME=zameni_staging
JWT_SECRET=staging-secret-key-change-in-production
LOG_LEVEL=info
```

### Production (.env.production)

```env
NODE_ENV=production
DB_HOST=production-db.example.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=production-password
DB_NAME=zameni_production
JWT_SECRET=production-secret-key-must-be-set
LOG_LEVEL=warn
```

## Проверка конфигурации

```bash
# Проверить конфигурацию development
npm run config:dev

# Проверить конфигурацию staging
npm run config:staging

# Проверить конфигурацию production
npm run config:prod
```

## Миграции

### Development

В development режиме TypeORM автоматически синхронизирует схему базы данных.

### Staging/Production

Для staging и production используйте миграции:

```bash
# Создать миграцию
npm run migration:generate -- src/database/migrations/MigrationName

# Запустить миграции
npm run migration:run

# Откатить миграции
npm run migration:revert
```

## Мониторинг

### Логи

```bash
# Development
npm run start:dev 2>&1 | tee logs/development.log

# Staging
npm run start:staging 2>&1 | tee logs/staging.log

# Production
npm run start:prod 2>&1 | tee logs/production.log
```

### Метрики

- **Development**: Подробные метрики для отладки
- **Staging**: Основные метрики для тестирования
- **Production**: Критические метрики для мониторинга

## Безопасность

### Development

- Отладочная информация включена
- Простые пароли
- Локальные настройки

### Staging

- Ограниченная отладочная информация
- Средние пароли
- Тестовые настройки

### Production

- Отладочная информация отключена
- Сложные пароли
- Продакшен настройки
- SSL/TLS
- Rate limiting
- Helmet security
