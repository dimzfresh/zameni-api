# Соглашения по именованию

## Окружения (Environments)

В проекте используется единый стандарт именования окружений:

### ✅ Правильно:
- `development` - для разработки
- `staging` - для тестирования
- `production` - для продакшена

### ❌ Неправильно:
- `dev` (вместо `development`)
- `stage` (вместо `staging`)
- `prod` (вместо `production`)

## Файлы конфигурации

### Environment файлы:
- `.env.development` - для разработки
- `.env.staging` - для тестирования
- `.env.production` - для продакшена

### Docker Compose файлы:
- `docker-compose.development.yml` - для разработки
- `docker-compose.staging.yml` - для тестирования
- `docker-compose.production.yml` - для продакшена
- `docker-compose.kafka.development.yml` - Kafka для разработки
- `docker-compose.kafka.staging.yml` - Kafka для тестирования
- `docker-compose.kafka.production.yml` - Kafka для продакшена

## Базы данных

### Имена баз данных:
- `zameni_development` - для разработки
- `zameni_staging` - для тестирования
- `zameni_production` - для продакшена

### Контейнеры PostgreSQL:
- `zameni-postgres-development` - для разработки
- `zameni-postgres-staging` - для тестирования
- `zameni-postgres-production` - для продакшена

## Kafka

### Контейнеры Kafka:
- `kafka-development` - для разработки
- `kafka-staging` - для тестирования
- `kafka-production` - для продакшена

### Контейнеры Zookeeper:
- `zookeeper-development` - для разработки
- `zookeeper-staging` - для тестирования
- `zookeeper-production` - для продакшена

### Kafka UI:
- `kafka-ui-development` - для разработки (порт 8080)
- `kafka-ui-staging` - для тестирования (порт 8081)
- `kafka-ui-production` - для продакшена (порт 8083)

## Портты

### PostgreSQL:
- `5432` - development
- `5433` - staging
- `5434` - production

### Kafka:
- `9092` - development
- `9093` - staging
- `9094` - production

### Kafka UI:
- `8080` - development
- `8081` - staging
- `8083` - production

### Schema Registry:
- `8081` - development
- `8082` - staging
- `8084` - production

## NPM скрипты

### Запуск приложения:
```bash
npm run start:dev          # development
npm run start:staging      # staging
npm run start:prod         # production
```

### Сборка:
```bash
npm run build:dev          # development
npm run build:staging      # staging
npm run build:prod         # production
```

### База данных:
```bash
npm run db:create:dev      # development
npm run db:create:staging  # staging
npm run db:create:prod     # production
```

### Kafka:
```bash
npm run kafka:up:dev       # development
npm run kafka:up:staging   # staging
npm run kafka:up:prod      # production
```

## Переменные окружения

### NODE_ENV:
```bash
NODE_ENV=development
NODE_ENV=staging
NODE_ENV=production
```

### Префиксы для переменных:
- `DEV_` - для development
- `STAGING_` - для staging
- `PROD_` - для production

## Примеры использования

### В коде:
```typescript
const environment = process.env.NODE_ENV || 'development';

switch (environment) {
  case 'development':
    // development config
    break;
  case 'staging':
    // staging config
    break;
  case 'production':
    // production config
    break;
  default:
    throw new Error(`Unknown environment: ${environment}`);
}
```

### В скриптах:
```bash
# Правильно
./scripts/database-setup.sh create development
./scripts/database-setup.sh create staging
./scripts/database-setup.sh create production

# Неправильно
./scripts/database-setup.sh create dev
./scripts/database-setup.sh create stage
./scripts/database-setup.sh create prod
```

### В Docker:
```bash
# Правильно
docker-compose -f docker-compose.development.yml up -d
docker-compose -f docker-compose.staging.yml up -d
docker-compose -f docker-compose.production.yml up -d

# Неправильно
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.stage.yml up -d
docker-compose -f docker-compose.prod.yml up -d
```

## Преимущества единого стандарта

1. **Консистентность** - все части проекта используют одинаковые имена
2. **Читаемость** - понятно, какое окружение используется
3. **Масштабируемость** - легко добавлять новые окружения
4. **Автоматизация** - скрипты работают предсказуемо
5. **Документация** - проще описывать процессы

## Миграция

При изменении именования:

1. Обновить все конфигурационные файлы
2. Обновить скрипты и документацию
3. Обновить CI/CD пайплайны
4. Уведомить команду о изменениях
5. Обновить переменные окружения на серверах
