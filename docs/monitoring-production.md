# Мониторинг и управление Production системой

## Как контролируют "зоопарк" в реальности

### 1. **Application Performance Monitoring (APM)**

#### New Relic
```typescript
// Автоматический мониторинг всех операций
import { NewRelic } from '@newrelic/nodejs';

@Injectable()
export class UserService {
  async createUser(data: any) {
    // New Relic автоматически отслеживает:
    // - Время выполнения
    // - Ошибки
    // - Запросы к БД
    // - Внешние API вызовы
    return this.userRepository.save(data);
  }
}
```

#### DataDog
```yaml
# datadog.yml
apm_config:
  enabled: true
  env: production
  service_name: zameni-api

logs_config:
  enabled: true
  logs_dd_url: https://logs.datadoghq.com
```

### 2. **Логирование и агрегация**

#### ELK Stack (Elasticsearch + Logstash + Kibana)
```typescript
// Структурированное логирование
@Injectable()
export class LoggerService {
  private logger = new Logger('UserService');

  async createUser(data: any) {
    this.logger.log({
      action: 'user_creation',
      userId: data.id,
      email: data.email,
      duration: Date.now() - startTime,
      success: true,
      metadata: {
        source: 'api',
        version: '1.0.0',
        environment: process.env.NODE_ENV
      }
    });
  }
}
```

#### Grafana + Loki
```yaml
# grafana/dashboards/api-metrics.json
{
  "dashboard": {
    "title": "Zameni API Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  }
}
```

### 3. **Метрики и алерты**

#### Prometheus + Grafana
```typescript
// Кастомные метрики
import { Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  private requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'endpoint', 'status']
  });

  private requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'endpoint']
  });

  private activeUsers = new Gauge({
    name: 'active_users_total',
    help: 'Total number of active users'
  });

  recordRequest(method: string, endpoint: string, status: number, duration: number) {
    this.requestCounter.inc({ method, endpoint, status });
    this.requestDuration.observe({ method, endpoint }, duration);
  }
}
```

### 4. **Health Checks и Readiness Probes**

```typescript
// Health checks для всех компонентов
@Controller('health')
export class HealthController {
  @Get()
  async checkHealth() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      kafka: await this.checkKafka(),
      externalApis: await this.checkExternalApis(),
      disk: await this.checkDiskSpace(),
      memory: await this.checkMemoryUsage()
    };

    const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
```

### 5. **Distributed Tracing**

#### Jaeger
```typescript
import { Tracer, Span } from 'opentracing';

@Injectable()
export class TracingService {
  private tracer: Tracer;

  async traceOperation(operationName: string, fn: () => Promise<any>) {
    const span = this.tracer.startSpan(operationName);
    
    try {
      const result = await fn();
      span.setTag('success', true);
      return result;
    } catch (error) {
      span.setTag('error', true);
      span.setTag('error.message', error.message);
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

### 6. **Circuit Breaker Pattern**

```typescript
// Защита от каскадных сбоев
import { CircuitBreaker } from 'opossum';

@Injectable()
export class ExternalApiService {
  private circuitBreaker = new CircuitBreaker(this.callExternalApi, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  });

  async callExternalApi() {
    // Вызов внешнего API
    return fetch('https://external-api.com/data');
  }

  async getData() {
    return this.circuitBreaker.fire();
  }
}
```

### 7. **Rate Limiting и Throttling**

```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 запросов в минуту
    }),
  ],
})
export class AppModule {}

@UseGuards(ThrottlerGuard)
@Controller('api')
export class ApiController {
  // Автоматическое ограничение скорости
}
```

### 8. **Configuration Management**

#### Consul/Vault
```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  async getDatabaseConfig() {
    return {
      host: await this.configService.get('DB_HOST'),
      password: await this.configService.get('DB_PASSWORD'),
      // Автоматическое обновление конфигурации
    };
  }
}
```

### 9. **Deployment и CI/CD**

#### Docker + Kubernetes
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zameni-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zameni-api
  template:
    metadata:
      labels:
        app: zameni-api
    spec:
      containers:
      - name: api
        image: zameni-api:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 10. **Alerting и Incident Management**

#### PagerDuty + Slack
```typescript
@Injectable()
export class AlertingService {
  async sendAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string) {
    const alert = {
      severity,
      message,
      timestamp: new Date().toISOString(),
      service: 'zameni-api',
      environment: process.env.NODE_ENV
    };

    // Отправка в PagerDuty
    await this.pagerDutyService.createIncident(alert);
    
    // Отправка в Slack
    await this.slackService.sendMessage(alert);
    
    // Отправка в email
    await this.emailService.sendAlert(alert);
  }
}
```

## Дашборды для мониторинга

### 1. **Grafana Dashboard**
```json
{
  "dashboard": {
    "title": "Zameni API Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active connections"
          }
        ]
      },
      {
        "title": "Kafka Lag",
        "type": "graph",
        "targets": [
          {
            "expr": "kafka_consumer_lag",
            "legendFormat": "Consumer lag"
          }
        ]
      }
    ]
  }
}
```

### 2. **Kibana Dashboard**
```json
{
  "dashboard": {
    "title": "Zameni API Logs",
    "panels": [
      {
        "title": "Error Logs",
        "type": "visualization",
        "visState": {
          "type": "table",
          "aggs": [
            {
              "type": "count",
              "schema": "metric"
            },
            {
              "type": "terms",
              "field": "level.keyword",
              "schema": "bucket"
            }
          ]
        }
      }
    ]
  }
}
```

## Автоматизация операций

### 1. **Auto-scaling**
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: zameni-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: zameni-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. **Auto-healing**
```typescript
@Injectable()
export class AutoHealingService {
  @Cron('*/5 * * * * *') // Каждые 5 секунд
  async checkAndHeal() {
    const health = await this.healthService.checkHealth();
    
    if (health.status === 'unhealthy') {
      await this.healService();
    }
  }

  private async healService() {
    // Перезапуск сервиса
    // Очистка кэша
    // Переподключение к БД
    // Уведомление команды
  }
}
```

## Рекомендации для production

### 1. **Обязательные метрики**
- Request rate (RPS)
- Response time (p50, p95, p99)
- Error rate
- Database connection pool usage
- Memory usage
- CPU usage
- Disk I/O
- Network I/O

### 2. **Алерты**
- Error rate > 5%
- Response time > 2s (p95)
- Database connections > 80%
- Memory usage > 85%
- Disk usage > 90%

### 3. **Логирование**
- Структурированные логи (JSON)
- Уровни логирования (ERROR, WARN, INFO, DEBUG)
- Корреляция запросов (request ID)
- Контекстная информация

### 4. **Мониторинг зависимостей**
- База данных
- Redis
- Kafka
- Внешние API
- Файловые системы

### 5. **Безопасность**
- Мониторинг подозрительной активности
- Логирование аутентификации
- Отслеживание изменений конфигурации
- Мониторинг SSL сертификатов
