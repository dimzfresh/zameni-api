# Стратегии многопоточности и масштабирования

## Текущие ограничения

### Пул соединений PostgreSQL
- **Лимит**: 20 соединений (настроено в production)
- **Проблема**: Может стать узким местом при высокой нагрузке
- **Память**: ~10MB на соединение

### Синхронная обработка
- Каждый запрос ждет ответа от БД
- Блокирует поток выполнения
- Медленно при большом количестве запросов

## Решения для масштабирования

### 1. Очереди сообщений (Kafka/RabbitMQ)

#### Преимущества:
- **Асинхронная обработка**: Запросы не ждут ответа
- **Масштабируемость**: Можно обрабатывать тысячи запросов
- **Надежность**: Сообщения не теряются
- **Отказоустойчивость**: Система продолжает работать при сбоях

#### Архитектура:
```
Client → API → Queue (Kafka) → Worker → Database
```

#### Пример с Kafka:
```typescript
// Регистрация пользователя
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  // Отправляем в очередь вместо прямой записи в БД
  await this.kafkaService.send('user.registration', registerDto);
  
  return {
    message: 'Регистрация принята в обработку',
    requestId: generateRequestId()
  };
}

// Worker обрабатывает очередь
@KafkaListener('user.registration')
async processRegistration(data: RegisterDto) {
  await this.userService.create(data);
  // Отправляем уведомление
  await this.notificationService.sendWelcomeEmail(data.email);
}
```

### 2. Кластеризация Node.js

#### Использование PM2:
```bash
# Запуск в кластере
pm2 start dist/main.js -i max

# Мониторинг
pm2 monit
```

#### Использование Docker Swarm:
```yaml
version: '3.8'
services:
  api:
    image: zameni-api
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 3. Горизонтальное масштабирование БД

#### Read Replicas:
```typescript
// Настройка TypeORM для read/write разделения
const config = {
  type: 'postgres',
  master: {
    host: 'master-db',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'zameni_production'
  },
  slaves: [
    {
      host: 'slave-db-1',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'zameni_production'
    }
  ]
};
```

#### Connection Pooling (PgBouncer):
```typescript
// Использование PgBouncer для пулинга соединений
const config = {
  type: 'postgres',
  host: 'pgbouncer',
  port: 6432,
  username: 'postgres',
  password: 'password',
  database: 'zameni_production',
  extra: {
    connectionLimit: 100, // Больше соединений через PgBouncer
  }
};
```

### 4. Кэширование (Redis)

#### Кэширование пользователей:
```typescript
@Injectable()
export class UserService {
  async findById(id: number): Promise<User> {
    // Сначала проверяем кэш
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Если нет в кэше, берем из БД
    const user = await this.userRepository.findOne(id);
    if (user) {
      // Сохраняем в кэш на 1 час
      await this.redis.setex(`user:${id}`, 3600, JSON.stringify(user));
    }
    
    return user;
  }
}
```

## Рекомендуемая архитектура для высоких нагрузок

### Уровень 1: API Gateway
- Nginx/HAProxy для балансировки нагрузки
- Rate limiting
- SSL termination

### Уровень 2: Application Servers
- Несколько экземпляров API
- Кластеризация через PM2/Docker
- Health checks

### Уровень 3: Message Queue
- Kafka для асинхронной обработки
- Dead letter queue для неудачных сообщений
- Мониторинг очередей

### Уровень 4: Database
- Master-Slave репликация
- PgBouncer для пулинга
- Read replicas для чтения

### Уровень 5: Caching
- Redis для кэширования
- CDN для статических файлов
- Browser caching

## Мониторинг производительности

### Метрики для отслеживания:
- RPS (Requests Per Second)
- Response time (p50, p95, p99)
- Database connection pool usage
- Queue depth
- Error rate

### Инструменты:
- Prometheus + Grafana
- New Relic
- DataDog
- ELK Stack

## Примеры конфигурации

### Docker Compose с Kafka:
```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      
  kafka:
    image: confluentinc/cp-kafka
    depends_on:
      - zookeeper
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      
  redis:
    image: redis:alpine
    
  pgbouncer:
    image: edoburu/pgbouncer
    environment:
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASSWORD: password
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 1000
      DEFAULT_POOL_SIZE: 20
```

### PM2 Ecosystem:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'zameni-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```
