# Защита от DDoS атак

## Проблема DDoS на регистрацию

### Что происходит при DDoS атаке на синхронные endpoints:

1. **Блокировка потоков** - каждый запрос занимает поток Node.js
2. **Перегрузка БД** - множество одновременных запросов к PostgreSQL
3. **Исчерпание памяти** - накопление запросов в памяти
4. **Медленная обработка** - очередь запросов растет экспоненциально
5. **Отказ в обслуживании** - система становится недоступной

### Пример DDoS атаки:
```bash
# Атака 1000 одновременных запросов на регистрацию
for i in {1..1000}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"user'$i'@example.com","name":"User'$i'","password":"password123"}' &
done
```

## Решение: Асинхронная архитектура

### Преимущества асинхронных endpoints:

1. **Мгновенный ответ** - API отвечает сразу, не блокируя потоки
2. **Контроль нагрузки** - очередь ограничивает количество одновременных операций
3. **Масштабируемость** - можно увеличить количество воркеров
4. **Отказоустойчивость** - система продолжает работать при перегрузке
5. **Мониторинг** - видно реальную нагрузку на систему

### Архитектура защиты:

```
Client → API Gateway → Queue (Kafka) → Workers → Database
```

## Наша реализация

### Все endpoints стали асинхронными:

```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  // Отправляем в очередь вместо прямой обработки
  const messageId = await this.queueService.send('user.registration', registerDto);
  
  return ResponseDto.success({
    messageId,
    message: 'Регистрация принята в обработку',
    requestId: generateRequestId()
  });
}
```

### Обработка в очереди:

```typescript
// Обработчик для регистрации пользователей
this.subscribe('user.registration', async (message) => {
  await this.processUserRegistration(message.data);
});
```

## Дополнительные меры защиты

### 1. Rate Limiting

```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 1 минута
      limit: 10, // 10 запросов в минуту с одного IP
    }),
  ],
})
export class AppModule {}
```

### 2. IP Whitelist/Blacklist

```typescript
@Injectable()
export class IpFilterService {
  private blacklist = new Set<string>();
  private whitelist = new Set<string>();

  isAllowed(ip: string): boolean {
    if (this.blacklist.has(ip)) return false;
    if (this.whitelist.size > 0 && !this.whitelist.has(ip)) return false;
    return true;
  }
}
```

### 3. CAPTCHA для регистрации

```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto & { captcha: string }) {
  // Проверяем CAPTCHA
  if (!await this.captchaService.verify(registerDto.captcha)) {
    throw new BadRequestException('Invalid CAPTCHA');
  }
  
  // Отправляем в очередь
  const messageId = await this.queueService.send('user.registration', registerDto);
  return ResponseDto.success({ messageId });
}
```

### 4. Мониторинг подозрительной активности

```typescript
@Injectable()
export class SecurityMonitor {
  private requestCounts = new Map<string, number>();
  private lastReset = Date.now();

  recordRequest(ip: string) {
    const now = Date.now();
    if (now - this.lastReset > 60000) { // Сброс каждую минуту
      this.requestCounts.clear();
      this.lastReset = now;
    }

    const count = this.requestCounts.get(ip) || 0;
    this.requestCounts.set(ip, count + 1);

    // Если больше 100 запросов в минуту - подозрительно
    if (count > 100) {
      this.blockIp(ip);
    }
  }

  private blockIp(ip: string) {
    // Добавляем IP в черный список
    this.ipFilterService.blacklist.add(ip);
    this.logger.warn(`IP ${ip} blocked due to suspicious activity`);
  }
}
```

## Мониторинг и алерты

### Метрики для отслеживания:

```typescript
@Injectable()
export class DdosMetrics {
  private requestRate = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'endpoint', 'ip']
  });

  private queueDepth = new Gauge({
    name: 'queue_depth',
    help: 'Number of pending messages in queue',
    labelNames: ['topic']
  });

  recordRequest(method: string, endpoint: string, ip: string) {
    this.requestRate.inc({ method, endpoint, ip });
  }

  setQueueDepth(topic: string, depth: number) {
    this.queueDepth.set({ topic }, depth);
  }
}
```

### Алерты:

```typescript
@Injectable()
export class DdosAlerts {
  async checkForDdos() {
    const metrics = await this.getMetrics();
    
    // Алерт при высокой нагрузке
    if (metrics.requestRate > 1000) {
      await this.sendAlert('HIGH_LOAD', `Request rate: ${metrics.requestRate} RPS`);
    }
    
    // Алерт при переполнении очереди
    if (metrics.queueDepth > 10000) {
      await this.sendAlert('QUEUE_OVERFLOW', `Queue depth: ${metrics.queueDepth}`);
    }
    
    // Алерт при подозрительных IP
    if (metrics.suspiciousIps.length > 0) {
      await this.sendAlert('SUSPICIOUS_IPS', `Suspicious IPs: ${metrics.suspiciousIps.join(', ')}`);
    }
  }
}
```

## Тестирование защиты

### Скрипт для тестирования DDoS защиты:

```bash
#!/bin/bash
# test-ddos-protection.sh

echo "🚀 Тестирование защиты от DDoS"
echo "=============================="

# Тест 1: Нормальная нагрузка
echo "📊 Тест 1: Нормальная нагрузка (10 RPS)"
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"name\":\"Test$i\",\"password\":\"password123\"}" &
done
wait

# Тест 2: Высокая нагрузка
echo "📊 Тест 2: Высокая нагрузка (100 RPS)"
for i in {1..100}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"load$i@example.com\",\"name\":\"Load$i\",\"password\":\"password123\"}" &
done
wait

# Тест 3: Экстремальная нагрузка
echo "📊 Тест 3: Экстремальная нагрузка (1000 RPS)"
for i in {1..1000}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ddos$i@example.com\",\"name\":\"Ddos$i\",\"password\":\"password123\"}" &
done
wait

echo "✅ Тестирование завершено"
```

## Рекомендации для production

### 1. **Обязательные меры:**
- ✅ Асинхронная обработка всех endpoints
- ✅ Rate limiting (10-100 RPS с одного IP)
- ✅ IP blacklist для подозрительных адресов
- ✅ Мониторинг нагрузки и алерты
- ✅ CAPTCHA для регистрации

### 2. **Дополнительные меры:**
- 🔒 WAF (Web Application Firewall)
- 🔒 CDN с DDoS защитой (Cloudflare, AWS Shield)
- 🔒 Географическое ограничение доступа
- 🔒 Временные блокировки при подозрении

### 3. **Мониторинг:**
- 📊 Request rate (RPS)
- 📊 Response time
- 📊 Queue depth
- 📊 Error rate
- 📊 Подозрительные IP адреса

### 4. **Алерты:**
- 🚨 Request rate > 1000 RPS
- 🚨 Queue depth > 10000
- 🚨 Error rate > 10%
- 🚨 Подозрительная активность с одного IP

## Результат

С асинхронной архитектурой:

1. **API остается доступным** даже при DDoS атаке
2. **Контролируемая нагрузка** на базу данных
3. **Мгновенные ответы** клиентам
4. **Возможность масштабирования** при необходимости
5. **Полная видимость** реальной нагрузки на систему

Это делает систему устойчивой к DDoS атакам и обеспечивает стабильную работу даже при высокой нагрузке.
