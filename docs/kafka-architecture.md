# Apache Kafka - Архитектура и принципы работы

## Основные концепции

### 1. **Producer (Продюсер)**
- Отправляет сообщения в Kafka
- Выбирает топик и партицию
- Может отправлять сообщения синхронно или асинхронно

### 2. **Consumer (Консьюмер)**
- Читает сообщения из Kafka
- Может читать из нескольких партиций
- Поддерживает групповое потребление

### 3. **Topic (Топик)**
- Категория сообщений (например, "user.registration")
- Разделяется на партиции для параллельной обработки
- Сообщения в партиции упорядочены

### 4. **Partition (Партиция)**
- Часть топика для параллельной обработки
- Каждое сообщение имеет уникальный offset
- Сообщения в партиции упорядочены по времени

### 5. **Broker (Брокер)**
- Сервер Kafka, хранящий данные
- Может быть несколько брокеров в кластере
- Каждый брокер отвечает за определенные партиции

### 6. **Zookeeper**
- Координатор кластера Kafka
- Хранит метаданные о топиках и партициях
- Управляет лидерством партиций

## Принцип работы

### Отправка сообщения:
```
Producer → Broker → Topic → Partition → Disk
```

### Чтение сообщения:
```
Consumer → Broker → Topic → Partition → Offset → Message
```

## Преимущества Kafka

### 1. **Высокая производительность**
- Zero-copy networking
- Batch processing
- Sequential disk I/O
- До 2 миллионов сообщений в секунду

### 2. **Надежность**
- Репликация данных
- Отказоустойчивость
- Гарантия доставки
- Сохранение на диск

### 3. **Масштабируемость**
- Горизонтальное масштабирование
- Партиционирование
- Распределенная архитектура

### 4. **Гибкость**
- Множественные консьюмеры
- Retention policies
- Schema evolution

## Примеры использования в нашем проекте

### 1. **Регистрация пользователей**
```typescript
// Producer
await kafkaProducer.send({
  topic: 'user.registration',
  messages: [{
    key: userId,
    value: JSON.stringify(userData)
  }]
});

// Consumer
@KafkaListener('user.registration')
async handleUserRegistration(message: any) {
  const userData = JSON.parse(message.value);
  await this.userService.create(userData);
  await this.emailService.sendWelcomeEmail(userData.email);
}
```

### 2. **Уведомления**
```typescript
// Producer
await kafkaProducer.send({
  topic: 'notification.send',
  messages: [{
    key: userId,
    value: JSON.stringify({
      type: 'email',
      to: userEmail,
      template: 'welcome',
      data: userData
    })
  }]
});

// Consumer
@KafkaListener('notification.send')
async handleNotification(message: any) {
  const notification = JSON.parse(message.value);
  await this.notificationService.send(notification);
}
```

### 3. **Аналитика**
```typescript
// Producer
await kafkaProducer.send({
  topic: 'user.activity',
  messages: [{
    key: userId,
    value: JSON.stringify({
      action: 'login',
      timestamp: new Date(),
      ip: userIp
    })
  }]
});

// Consumer для аналитики
@KafkaListener('user.activity')
async handleUserActivity(message: any) {
  const activity = JSON.parse(message.value);
  await this.analyticsService.track(activity);
}
```

## Конфигурация Kafka

### Docker Compose для разработки:
```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    hostname: zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-logs:/var/lib/zookeeper/log

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    hostname: kafka
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9101:9101"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_JMX_PORT: 9101
      KAFKA_JMX_HOSTNAME: localhost
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
      KAFKA_DELETE_TOPIC_ENABLE: 'true'
    volumes:
      - kafka-data:/var/lib/kafka/data

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui
    depends_on:
      - kafka
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181

volumes:
  zookeeper-data:
  zookeeper-logs:
  kafka-data:
```

### Настройки для production:
```yaml
# kafka-production.yml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
      ZOOKEEPER_INIT_LIMIT: 5
      ZOOKEEPER_SYNC_LIMIT: 2
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
    deploy:
      replicas: 3

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: ${BROKER_ID}
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-${BROKER_ID}:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
      KAFKA_LOG_RETENTION_HOURS: 168
      KAFKA_LOG_SEGMENT_BYTES: 1073741824
      KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
    volumes:
      - kafka-data-${BROKER_ID}:/var/lib/kafka/data
    deploy:
      replicas: 3
```

## Интеграция с NestJS

### Установка зависимостей:
```bash
npm install @nestjs/microservices kafkajs
npm install -D @types/kafkajs
```

### Конфигурация Kafka модуля:
```typescript
// kafka.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'zameni-api',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'zameni-api-consumer',
          },
        },
      },
    ]),
  ],
  providers: [KafkaService],
  controllers: [KafkaController],
  exports: [KafkaService],
})
export class KafkaModule {}
```

### Kafka сервис:
```typescript
// kafka.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'zameni-api',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'zameni-api-consumer',
      },
    },
  })
  private client: ClientKafka;

  async onModuleInit() {
    await this.client.connect();
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    await this.client.emit(topic, message).toPromise();
  }

  async sendMessageWithKey(topic: string, key: string, message: any): Promise<void> {
    await this.client.emit(topic, {
      key,
      value: message,
    }).toPromise();
  }
}
```

### Kafka контроллер (консьюмер):
```typescript
// kafka.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../profile/profile.service';
import { EmailService } from '../email/email.service';

@Controller()
export class KafkaController {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  @MessagePattern('user.registration')
  async handleUserRegistration(@Payload() message: any) {
    const userData = JSON.parse(message.value);
    
    try {
      // Создаем пользователя
      const user = await this.userService.create(userData);
      
      // Отправляем приветственное письмо
      await this.emailService.sendWelcomeEmail(user.email);
      
      // Логируем событие
      console.log(`User ${user.id} registered successfully`);
      
    } catch (error) {
      console.error('Error processing user registration:', error);
      throw error; // Kafka повторит обработку
    }
  }

  @MessagePattern('notification.send')
  async handleNotification(@Payload() message: any) {
    const notification = JSON.parse(message.value);
    
    try {
      await this.emailService.send(notification);
      console.log(`Notification sent to ${notification.to}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}
```

## Мониторинг и управление

### Kafka UI (веб-интерфейс):
- Доступен по адресу: http://localhost:8080
- Просмотр топиков и партиций
- Мониторинг консьюмеров
- Отправка тестовых сообщений

### Командная строка:
```bash
# Создание топика
kafka-topics --create --topic user.registration --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# Просмотр топиков
kafka-topics --list --bootstrap-server localhost:9092

# Отправка сообщения
kafka-console-producer --topic user.registration --bootstrap-server localhost:9092

# Чтение сообщений
kafka-console-consumer --topic user.registration --bootstrap-server localhost:9092 --from-beginning
```

## Преимущества над встроенной очередью

### 1. **Надежность**
- ✅ Сообщения сохраняются на диск
- ✅ Репликация между серверами
- ✅ Гарантия доставки
- ❌ Встроенная очередь: теряется при перезапуске

### 2. **Масштабируемость**
- ✅ Миллионы сообщений в секунду
- ✅ Горизонтальное масштабирование
- ✅ Партиционирование
- ❌ Встроенная очередь: ограничена памятью

### 3. **Мониторинг**
- ✅ Kafka UI для визуализации
- ✅ Метрики и алерты
- ✅ Отслеживание отставания консьюмеров
- ❌ Встроенная очередь: нет мониторинга

### 4. **Экосистема**
- ✅ Kafka Connect для интеграций
- ✅ Kafka Streams для обработки
- ✅ Schema Registry
- ❌ Встроенная очередь: только базовый функционал
